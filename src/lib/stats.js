/**
 * Shared statistics (D-09): pure functions over the task list, used by the
 * Dashboard and Analytics. They never read the clock and never throw for
 * empty input. Rates are integer percentages 0–100, or null when there is no data.
 */

/**
 * BR-01 rounding with the PRD's two honesty rules (PRD §4 "Definitions"):
 * - no tasks → null (BR-06), never 0%;
 * - a partial result (0 < completed < total) is clamped to 1–99, so rounding never
 *   shows 100% while a task is still pending, or 0% after a task is done.
 */
export function toRate(completed, total) {
  if (total === 0) return null
  if (completed === 0) return 0
  if (completed === total) return 100
  return Math.min(99, Math.max(1, Math.round((completed / total) * 100)))
}

/**
 * Totals for the tasks whose taskDate is between `from` and `to` (inclusive).
 * Only taskDate decides where a task counts; when it was completed does not (BR-01).
 */
export function countTasksInRange(tasks, from, to) {
  let total = 0
  let completed = 0
  for (const task of tasks) {
    if (task.taskDate < from || task.taskDate > to) continue
    total += 1
    if (task.status === 'completed') completed += 1
  }
  return { total, completed, rate: toRate(completed, total) }
}

/** @returns {{date: string, total: number, completed: number, remaining: number, rate: number|null}} (BR-01, BR-06) */
export function getDailyStats(tasks, date) {
  const { total, completed, rate } = countTasksInRange(tasks, date, date)
  return { date, total, completed, remaining: total - completed, rate }
}
