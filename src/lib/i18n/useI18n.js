import { useContext } from 'react'
import { I18nContext } from './I18nContext.js'

/**
 * Returns { lang, dir, t, setLanguage, formatDate, formatDay }.
 * formatDate takes a Date; formatDay takes a "YYYY-MM-DD" calendar day (D-10).
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>')
  return context
}
