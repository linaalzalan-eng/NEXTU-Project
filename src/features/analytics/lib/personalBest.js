import { startOfWeek } from '@/lib/dates.js'

/** The key with the highest count; a tie goes to the most recent key (dates compare as strings). */
function pickBest(counts) {
  let best = null
  for (const [key, completed] of counts) {
    if (!best || completed > best.completed || (completed === best.completed && key > best.key)) {
      best = { key, completed }
    }
  }
  return best
}

/**
 * BR-05: the best day and best week by number of completed tasks.
 * - Only tasks dated today or earlier count, so completed tasks planned for
 *   the future are ignored until their day arrives.
 * - Counts, not rates: 1 of 1 = 100% would be an easy, misleading record.
 * - Ties go to the most recent day or week, so matching the record counts as best.
 * - Both are null until at least one task has been completed.
 */
export function getPersonalBest(tasks, today) {
  const byDay = new Map()
  for (const task of tasks) {
    if (task.status !== 'completed' || task.taskDate > today) continue
    byDay.set(task.taskDate, (byDay.get(task.taskDate) ?? 0) + 1)
  }

  // Weeks are built from the day totals, so startOfWeek runs once per day, not per task.
  const byWeek = new Map()
  for (const [date, completed] of byDay) {
    const weekStart = startOfWeek(date)
    byWeek.set(weekStart, (byWeek.get(weekStart) ?? 0) + completed)
  }

  const day = pickBest(byDay)
  const week = pickBest(byWeek)
  const bestDay = day && { date: day.key, completed: day.completed }
  const bestWeek = week && { weekStart: week.key, completed: week.completed }

  return {
    bestDay,
    bestWeek,
    isTodayBest: bestDay !== null && bestDay.date === today,
    isThisWeekBest: bestWeek !== null && bestWeek.weekStart === startOfWeek(today),
  }
}
