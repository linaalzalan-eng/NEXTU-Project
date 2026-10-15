import { addDays, startOfWeek } from '@/lib/dates.js'
import { countTasksInRange, toRate } from '@/lib/stats.js'

/** BR-03: the Saturday–Friday week that contains `date`. */
export function getWeekRange(date) {
  const weekStart = startOfWeek(date)
  return { weekStart, weekEnd: addDays(weekStart, 6) }
}

/**
 * One full week (BR-02, BR-03) with a row per day, Saturday first.
 * The week's rate adds up all of its tasks; it is not the average of the daily
 * rates. Days and weeks without tasks keep counts of 0 and a null rate (BR-06).
 * Charts use full weeks; the "so far" comparison uses compareWeeksToDate (BR-04).
 */
export function getWeeklyStats(tasks, weekStart) {
  const weekEnd = addDays(weekStart, 6)
  const dates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const byDate = new Map(dates.map((date) => [date, { total: 0, completed: 0 }]))

  // One pass over the list, so a long history stays fast (NFR-04).
  for (const task of tasks) {
    const day = byDate.get(task.taskDate)
    if (!day) continue
    day.total += 1
    if (task.status === 'completed') day.completed += 1
  }

  let total = 0
  let completed = 0
  const days = dates.map((date) => {
    const day = byDate.get(date)
    total += day.total
    completed += day.completed
    return { date, ...day, remaining: day.total - day.completed, rate: toRate(day.completed, day.total) }
  })

  return { weekStart, weekEnd, total, completed, rate: toRate(completed, total), days }
}

/**
 * BR-04: this week so far (Saturday through today) against the same weekdays
 * exactly 7 days earlier. rateDelta is in percentage points, computed from the
 * displayed rates, and null when either week has no tasks ("Not enough data").
 */
export function compareWeeksToDate(tasks, today) {
  const from = startOfWeek(today)
  const summarize = (start, end) => ({ from: start, to: end, ...countTasksInRange(tasks, start, end) })
  const current = summarize(from, today)
  const previous = summarize(addDays(from, -7), addDays(today, -7))

  return {
    current,
    previous,
    completedDelta: current.completed - previous.completed,
    rateDelta: current.rate === null || previous.rate === null ? null : current.rate - previous.rate,
  }
}

/** The last `weeks` full weeks, oldest first, ending with the current week. Empty weeks are included (BR-06). */
export function getWeeklyHistory(tasks, today, weeks = 8) {
  const currentWeekStart = startOfWeek(today)
  return Array.from({ length: weeks }, (_, index) =>
    getWeeklyStats(tasks, addDays(currentWeekStart, (index - weeks + 1) * 7)),
  )
}

/**
 * Totals for the trend summary (FR-32): completed tasks across the history, and
 * the week with the most completions. A tie goes to the most recent week, as for
 * the personal best (BR-05). `strongest` is null when nothing was completed.
 */
export function summarizeHistory(history) {
  let totalCompleted = 0
  let strongest = null
  for (const week of history) {
    totalCompleted += week.completed
    if (week.completed > 0 && (!strongest || week.completed >= strongest.completed)) strongest = week
  }
  return { totalCompleted, strongest: strongest && { weekStart: strongest.weekStart, completed: strongest.completed } }
}
