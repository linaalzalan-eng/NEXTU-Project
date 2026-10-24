import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

const LANGUAGES = [{ code: 'ar', label: 'عربي' }, { code: 'en', label: 'EN' }]

/** Explicit choices keep the active language visible and retain native keyboard behavior. */
export function LanguageSwitch({ compact = false, className }) {
  const { t, lang, setLanguage } = useI18n()
  return (
    <div role="group" aria-label={t('language.label')} dir="ltr"
      className={cx('inline-flex h-11 shrink-0 items-stretch rounded-md border border-line bg-surface', className)}>
      {LANGUAGES.map(({ code, label }) => (
        <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLanguage(code)}
          className={cx(
            'flex flex-1 items-center justify-center border-line font-medium transition-colors duration-150 first:rounded-s-md last:rounded-e-md last:border-s',
            compact ? 'min-w-7 px-1 text-xs' : 'min-w-11 px-3 text-sm',
            lang === code ? 'bg-pine-50 font-semibold text-pine-700' : 'text-ink-2 hover:bg-sunken hover:text-ink',
          )}>
          <span lang={code} dir={code === 'ar' ? 'rtl' : 'ltr'}>{label}</span>
        </button>
      ))}
    </div>
  )
}
