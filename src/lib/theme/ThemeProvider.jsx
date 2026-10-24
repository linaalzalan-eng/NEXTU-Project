import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { applyTheme, normalizeTheme, readTheme, THEME_STORAGE_KEY } from './theme.js'

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readTheme)
  const resolvedTheme = preference

  useEffect(() => {
    applyTheme(resolvedTheme)
    try { localStorage.setItem(THEME_STORAGE_KEY, preference) } catch { /* Visit-only preference when storage is blocked. */ }
  }, [preference, resolvedTheme])

  useEffect(() => {
    function sync(event) {
      if (event.storageArea && event.storageArea !== localStorage) return
      if (event.key === THEME_STORAGE_KEY || event.key === null) setPreference(normalizeTheme(event.newValue))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const setTheme = useCallback(next => setPreference(normalizeTheme(next)), [])
  const value = useMemo(() => ({ preference, resolvedTheme, setTheme }), [preference, resolvedTheme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
