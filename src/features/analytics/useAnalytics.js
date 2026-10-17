import { useMemo } from 'react'
import { useTasks } from '@/features/tasks/useTasks.js'
import { useToday } from '@/lib/useToday.js'
import { getPersonalBest } from './lib/personalBest.js'
import { compareWeeksToDate, getWeeklyHistory, summarizeHistory } from './lib/weeklyStats.js'

/** Weeks shown in the trend chart (FR-32). */
export const TREND_WEEKS = 8

/**
 * Everything the Analytics page shows, computed from the loaded task list (D-09).
 * The pure functions run inside useMemo, so they run again only when the tasks
 * or "today" change (for example after a toggle, or at midnight, BR-10/BR-11).
 */
export function useAnalytics() {
  const today = useToday()
  const { tasks, loadStatus, error, reload } = useTasks()

  const stats = useMemo(() => {
    const history = getWeeklyHistory(tasks, today, TREND_WEEKS)
    return {
      comparison: compareWeeksToDate(tasks, today),
      // The last two entries of the history are the current and previous full weeks (FR-31).
      currentWeek: history.at(-1),
      previousWeek: history.at(-2),
      history,
      historySummary: summarizeHistory(history),
      best: getPersonalBest(tasks, today),
    }
  }, [tasks, today])

  return { loadStatus, error, reload, today, hasTasks: tasks.length > 0, ...stats }
}
