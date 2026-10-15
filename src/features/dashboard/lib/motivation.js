import { toRate } from '@/lib/stats.js'

/**
 * BR-13: picks today's encouraging message from today's counts.
 * "None done" and "all done" are decided from the raw counts, never from a
 * rounded rate, so 199/200 is "close" (not "done") and 1/201 is "started"
 * (not "zero"). Between them, the band follows the rate the user sees
 * (1–49 started, 50–99 close), so the message always matches the number.
 * Returns an i18n key; the text lives in ar.js and en.js.
 */
export function getMotivationKey({ completed, total }) {
  if (total === 0) return 'motivation.noTasks'
  if (completed === 0) return 'motivation.zero'
  if (completed === total) return 'motivation.done'
  return toRate(completed, total) >= 50 ? 'motivation.close' : 'motivation.started'
}
