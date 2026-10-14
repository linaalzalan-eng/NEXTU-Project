import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/** A small ring spinner with a hidden text label for screen readers. */
export function Spinner({ className }) {
  const { t } = useI18n()
  return (
    <span className={cx('inline-flex items-center', className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.15em] motion-safe:animate-spin">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{t('common.loading')}</span>
    </span>
  )
}
