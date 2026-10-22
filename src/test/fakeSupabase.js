import { vi } from 'vitest'

/**
 * A stand-in for the Supabase client, for the services in src/services/supabase/.
 * It does no I/O. Each `from(table)` query records its chained calls in `queries`
 * and, when awaited, resolves to the next entry of `responses` (default: no rows).
 * Auth methods are vi.fn()s that tests set up; `emit(event, session)` plays an
 * auth event to every onAuthStateChange listener.
 */
export function createFakeSupabase({ session = { user: { id: 'user-a', email: 'a@example.com' } } } = {}) {
  const queries = []
  const responses = []
  const listeners = new Set()

  const auth = {
    getSession: vi.fn(async () => ({ data: { session }, error: null })),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(async () => ({ error: null })),
    resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn((callback) => {
      listeners.add(callback)
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } }
    }),
  }

  function from(table) {
    const query = { table, calls: [] }
    queries.push(query)
    const builder = new Proxy(
      {},
      {
        get(_, method) {
          // `await builder` calls then(): answer with the next prepared response.
          if (method === 'then') {
            const response = responses.shift() ?? { data: [], error: null, status: 200 }
            return (resolve, reject) => Promise.resolve(response).then(resolve, reject)
          }
          return (...args) => {
            query.calls.push([method, ...args])
            return builder
          }
        },
      },
    )
    return builder
  }

  return {
    client: { auth, from },
    queries,
    /** Queues the result of the next awaited query: { data, error, status }. */
    respond(response) {
      responses.push({ data: null, error: null, status: 200, ...response })
    },
    emit(event, nextSession) {
      for (const listener of listeners) listener(event, nextSession)
    },
    listenerCount: () => listeners.size,
  }
}

/** A database row as Supabase returns it, with Postgres-style timestamps. */
export function makeRow(overrides = {}) {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    user_id: 'user-a',
    title: 'Read 10 pages',
    status: 'pending',
    task_date: '2026-10-14',
    created_at: '2026-10-14T09:00:00.123456+00:00',
    updated_at: '2026-10-14T09:00:00.123456+00:00',
    completed_at: null,
    ...overrides,
  }
}
