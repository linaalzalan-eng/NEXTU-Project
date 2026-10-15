import { useEffect, useState } from 'react'
import { todayLocal } from './dates.js'

/** Milliseconds until the next local midnight, plus a small margin. */
function msUntilNextDay(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime() + 1000
}

/**
 * Today's local date as "YYYY-MM-DD" (BR-10). It updates at local midnight and
 * whenever the window regains focus or becomes visible, so a page left open
 * overnight moves to the new day. (Browsers slow down timers in background tabs;
 * the focus and visibility checks cover that.)
 */
export function useToday() {
  const [today, setToday] = useState(() => todayLocal())

  useEffect(() => {
    // Setting the same string again does not re-render.
    const refresh = () => setToday(todayLocal())
    let timer

    function scheduleMidnight() {
      timer = setTimeout(() => {
        refresh()
        scheduleMidnight()
      }, msUntilNextDay())
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refresh()
    }

    scheduleMidnight()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return today
}
