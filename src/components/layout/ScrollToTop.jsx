import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Declarative-mode React Router keeps the scroll position between pages.
 * This scrolls back to the top whenever the path changes (not for ?preview= changes).
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
