/**
 * Security tests ST-01 to ST-07 (TESTING_PLAN §4) against the real Supabase project.
 * It signs in as two test accounts, A and B, and tries what RLS and the constraints
 * must refuse. Every row it creates is deleted at the end.
 *
 * The owner runs it (Claude never reads .env.local, D-20):
 *   npm run test:security
 * which is: node --env-file=.env.local scripts/security-tests.mjs
 *
 * Needed in .env.local, besides the app's two Supabase variables: two confirmed test
 * accounts that hold no real data.
 *   ST_A_EMAIL, ST_A_PASSWORD, ST_B_EMAIL, ST_B_PASSWORD
 * The script prints only PASS/FAIL lines and error codes, never keys or passwords.
 */
import { createClient } from '@supabase/supabase-js'

const env = process.env
const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'ST_A_EMAIL',
  'ST_A_PASSWORD',
  'ST_B_EMAIL',
  'ST_B_PASSWORD',
]
const missing = required.filter((name) => !env[name])
if (missing.length > 0) {
  console.error(`Missing in .env.local: ${missing.join(', ')}`)
  process.exit(1)
}

// A separate client per account; nothing is saved to disk.
const makeClient = () =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

const results = []
function check(id, name, ok, detail = '') {
  results.push({ id, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail ? `  (${detail})` : ''}`)
}

async function signIn(email, password) {
  const client = makeClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Could not sign in a test account: ${error.code ?? error.message}`)
  return { client, userId: data.user.id }
}

const today = new Date().toISOString().slice(0, 10)
const a = await signIn(env.ST_A_EMAIL, env.ST_A_PASSWORD)
const b = await signIn(env.ST_B_EMAIL, env.ST_B_PASSWORD)
const anon = makeClient()
const created = { a: [], b: [] }

async function insertProbe(account, key, title) {
  const { data, error } = await account.client.from('tasks').insert({ title, task_date: today }).select().single()
  if (error) throw new Error(`Could not create a probe task: ${error.code}`)
  created[key].push(data.id)
  return data
}

try {
  const taskA = await insertProbe(a, 'a', 'ST probe of A')
  const taskB = await insertProbe(b, 'b', 'ST probe of B')

  // ST-01: A reads only A's rows.
  {
    const { data, error } = await a.client.from('tasks').select('id, user_id')
    const onlyOwn = !error && data.every((row) => row.user_id === a.userId)
    const seesOwn = data?.some((row) => row.id === taskA.id)
    const seesOther = data?.some((row) => row.id === taskB.id)
    check('ST-01', 'A selects only A’s rows', onlyOwn && seesOwn && !seesOther, error?.code)
  }

  // ST-02: A updates B's task by id → 0 rows, and B's title is unchanged.
  {
    const { data, error } = await a.client.from('tasks').update({ title: 'changed by A' }).eq('id', taskB.id).select()
    const { data: still } = await b.client.from('tasks').select('title').eq('id', taskB.id).single()
    check('ST-02', 'A cannot update B’s task', !error && data.length === 0 && still?.title === taskB.title, error?.code)
  }

  // ST-03: A deletes B's task by id → 0 rows, and it still exists for B.
  {
    const { data, error } = await a.client.from('tasks').delete().eq('id', taskB.id).select()
    const { data: still } = await b.client.from('tasks').select('id').eq('id', taskB.id)
    check('ST-03', 'A cannot delete B’s task', !error && data.length === 0 && still?.length === 1, error?.code)
  }

  // ST-04: A inserts a row owned by B → refused by RLS.
  {
    const { data, error } = await a.client
      .from('tasks')
      .insert({ title: 'ST forged owner', task_date: today, user_id: b.userId })
      .select()
    if (data?.[0]) created.a.push(data[0].id)
    check('ST-04', 'A cannot insert a task for B', error?.code === '42501', error?.code ?? 'inserted!')
  }

  // ST-05: no session → no rows. Expected: a permission error, because anon has no grant (D-30).
  // Any other error (network, wrong key) fails the check, so it cannot pass for the wrong reason.
  {
    const { data, error } = await anon.from('tasks').select('id')
    const refused = error ? error.code === '42501' : data.length === 0
    check('ST-05', 'a visitor without a session reads nothing', refused, error?.code)
  }

  // ST-06: A moves A's own task to B → refused by WITH CHECK.
  {
    const { data, error } = await a.client.from('tasks').update({ user_id: b.userId }).eq('id', taskA.id).select()
    check('ST-06', 'A cannot hand a task to B', error?.code === '42501' && !data?.length, error?.code ?? 'updated!')
  }

  // ST-07: constraints (NFR-20).
  {
    const attempts = [
      ['empty title', { title: '   ', task_date: today }],
      ['201-character title', { title: 'x'.repeat(201), task_date: today }],
      ['invalid status', { title: 'ST bad status', task_date: today, status: 'done' }],
      ['completed without completed_at', { title: 'ST bad completion', task_date: today, status: 'completed' }],
      ['completed_at while pending', { title: 'ST bad pending', task_date: today, completed_at: new Date().toISOString() }],
    ]
    for (const [name, row] of attempts) {
      const { data, error } = await a.client.from('tasks').insert(row).select()
      if (data?.[0]) created.a.push(data[0].id)
      check('ST-07', `rejects: ${name}`, error?.code === '23514', error?.code ?? 'inserted!')
    }
  }
} catch (error) {
  console.error(`Stopped: ${error.message}`)
  process.exitCode = 1
} finally {
  // Clean up with each owner's own session.
  for (const [account, ids] of [
    [a, created.a],
    [b, created.b],
  ]) {
    if (ids.length > 0) await account.client.from('tasks').delete().in('id', ids)
  }
  await Promise.all([a.client.auth.signOut(), b.client.auth.signOut()])
}

const failed = results.filter((result) => !result.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
if (failed > 0) process.exitCode = 1
