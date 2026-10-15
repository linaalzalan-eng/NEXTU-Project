/**
 * DEVELOPMENT ONLY (P4-T01). Fills the mock service with realistic task history
 * so the Dashboard and Analytics can be reviewed with real calculations.
 * main.jsx loads this file only when import.meta.env.DEV is true, so it is never
 * part of a production build.
 *
 * In the browser console (npm run dev):
 *   nextu.seed()                → about 10 weeks of tasks (replaces the current tasks)
 *   nextu.seed({ weeks: 4 })    → a shorter history
 *   nextu.seed({ count: 5000 }) → exactly 5,000 tasks, for the NFR-04 performance check
 *   nextu.clear()               → removes every task
 */
import { addDays, startOfWeek, todayLocal } from '@/lib/dates.js'
import { DEMO_USER } from './mockAuthService.js'
import { TASKS_STORAGE_KEY } from './mockTasksService.js'

// User content, so the titles stay as written in either UI language (and test dir="auto").
const TITLES = [
  'قراءة 20 صفحة',
  'مراجعة ملاحظات الاجتماع',
  'تمرين رياضي 30 دقيقة',
  'الرد على الرسائل المهمة',
  'ترتيب المكتب',
  'Morning run — 5 km',
  'Review pull requests',
  'Study React Router docs',
  'Call the bank',
  'Plan next week',
  'كتابة ملخص الدرس',
  'Practice SQL joins',
  'شرب 8 أكواب ماء',
  'Write the weekly report',
  'تعلّم 10 كلمات جديدة',
  'Prepare tomorrow’s lunch',
]

const DAY_MS = 24 * 60 * 60 * 1000

/** Small seeded random generator (mulberry32): the same seed always gives the same data. */
function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds the seed tasks (pure, so it can be tested). Every task follows the
 * contract (API_CONTRACTS §1), BR-12 (completedAt only when completed), and
 * BR-14 (dates up to today + 365 days).
 *
 * The story it tells: the completion rate slowly improves over the weeks, some
 * days are empty (BR-06), a few recent tasks are still open (overdue, BR-09),
 * and a few tasks are planned for the next days. Most old unfinished tasks are
 * left out, as if the user had deleted them, so the overdue list stays realistic.
 */
export function buildSeedTasks({ today, weeks = 10, count, seed = 7, now = new Date() } = {}) {
  const random = createRandom(seed)
  const pick = (list) => list[Math.floor(random() * list.length)]
  const firstDay = count ? null : addDays(startOfWeek(today), -7 * (weeks - 1))
  const span = count ? Math.ceil(count / 4) : null // about 4 tasks a day on average
  const tasks = []

  // Walk backwards from three days after today, so `count` mode can stop at exactly `count`.
  for (let offset = 3; ; offset -= 1) {
    const date = addDays(today, offset)
    if (count ? tasks.length >= count : date < firstDay) break

    // 0 = the oldest day, 1 = today. Drives the slow improvement.
    const age = -offset
    const progress = count ? 1 - Math.min(1, age / span) : 1 - age / (weeks * 7)
    const isEmptyDay = offset !== 0 && random() < 0.12
    const perDay = isEmptyDay ? 0 : 1 + Math.floor(random() * 6)

    for (let index = 0; index < perDay; index += 1) {
      if (count && tasks.length >= count) break
      const created = new Date(Date.parse(`${date}T06:00:00.000Z`) + index * 37 * 60 * 1000 - 2 * DAY_MS)
      const createdAt = new Date(Math.min(created.getTime(), now.getTime())).toISOString()
      let completed = false
      if (offset < 0) completed = random() < 0.5 + 0.4 * progress + (random() - 0.5) * 0.2
      else if (offset === 0) completed = index % 2 === 0

      // Old unfinished tasks are usually deleted by a real user; keep only a few (count mode keeps all).
      if (!count && !completed && offset < -10 && random() < 0.6) continue

      const completedAt = completed
        ? new Date(Math.min(Date.parse(createdAt) + (2 + index) * 60 * 60 * 1000, now.getTime())).toISOString()
        : null
      tasks.push({
        id: `seed-${String(tasks.length + 1).padStart(5, '0')}`,
        userId: DEMO_USER.id,
        title: pick(TITLES),
        status: completed ? 'completed' : 'pending',
        taskDate: date,
        createdAt,
        updatedAt: completedAt ?? createdAt,
        completedAt,
      })
    }
  }
  return tasks
}

/** Adds `nextu.seed()` and `nextu.clear()` to the browser console. Called from main.jsx in development only. */
export function installDevSeed() {
  window.nextu = {
    seed(options = {}) {
      const tasks = buildSeedTasks({ today: todayLocal(), ...options })
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
      console.info(`[nextu] Seeded ${tasks.length} tasks. Reloading…`)
      window.location.reload()
    },
    clear() {
      localStorage.removeItem(TASKS_STORAGE_KEY)
      console.info('[nextu] Removed all tasks. Reloading…')
      window.location.reload()
    },
  }
  console.info('[nextu] Development data: nextu.seed(), nextu.seed({ count: 5000 }), nextu.clear()')
}
