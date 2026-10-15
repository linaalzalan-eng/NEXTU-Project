import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseDate } from '../dates.js'
import { I18nContext } from './I18nContext.js'
import { translate } from './translate.js'

// Also read by the inline script in index.html; keep both in sync.
const LANGUAGE_STORAGE_KEY = 'mind.lang'
const DIRECTIONS = { ar: 'rtl', en: 'ltr' }
// ar-u-nu-latn keeps Latin digits in Arabic (D-02).
const LOCALES = { ar: 'ar-u-nu-latn', en: 'en' }

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return Object.hasOwn(DIRECTIONS, stored) ? stored : 'ar'
  } catch {
    return 'ar'
  }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = DIRECTIONS[lang]
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // Storage can be blocked (private mode); the choice then lasts for this visit only.
    }
  }, [lang])

  const setLanguage = useCallback((next) => {
    if (Object.hasOwn(DIRECTIONS, next)) setLang(next)
  }, [])

  const value = useMemo(
    () => ({
      lang,
      dir: DIRECTIONS[lang],
      setLanguage,
      t: (key, params) => translate(lang, key, params),
      formatDate: (date, options) => new Intl.DateTimeFormat(LOCALES[lang], options).format(date),
      // A "YYYY-MM-DD" calendar day is parsed as UTC midnight, so it must also be
      // formatted in UTC; otherwise zones behind UTC would show the previous day.
      formatDay: (dateString, options) =>
        new Intl.DateTimeFormat(LOCALES[lang], { ...options, timeZone: 'UTC' }).format(parseDate(dateString)),
    }),
    [lang, setLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
