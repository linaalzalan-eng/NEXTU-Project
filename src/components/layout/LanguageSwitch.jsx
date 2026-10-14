import { Languages } from 'lucide-react'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

// Each language name is written in its own language, so it is not translated.
const OTHER_LANGUAGE = {
  ar: { code: 'en', name: 'English' },
  en: { code: 'ar', name: 'العربية' },
}

/** One button that shows the other language's name, written in that language (US-23). */
export function LanguageSwitch({ className }) {
  const { t, lang, setLanguage } = useI18n()
  const other = OTHER_LANGUAGE[lang]

  return (
    <button
      type="button"
      onClick={() => setLanguage(other.code)}
      title={t('language.change')}
      className={cx(
        'inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-ink-2',
        'transition-colors duration-150 hover:bg-sunken hover:text-ink',
        className,
      )}
    >
      <Languages aria-hidden="true" className="size-[1.15rem] shrink-0" />
      <span lang={other.code}>{other.name}</span>
    </button>
  )
}
