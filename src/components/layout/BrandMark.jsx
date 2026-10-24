import { Link } from 'react-router'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/** U (you), with its rising right stem becoming an arrow. The symbol never mirrors in RTL. */
export function BrandMark({ inverted = false, className }) {
  const { t } = useI18n()
  return (
    <Link to="/dashboard" aria-label={t('app.name')} className={cx('inline-flex items-center gap-2.5 rounded-md', inverted ? 'text-on-inverse focus-visible:outline-on-inverse' : 'text-ink', className)}>
      <svg aria-hidden="true" viewBox="0 0 36 36" className="size-9 shrink-0">
        <rect width="36" height="36" rx="10" className={inverted ? 'fill-on-inverse' : 'fill-pine-600'} />
        <path d="M10 12v9a7 7 0 0 0 14 0V9m-5 5 5-5 5 5" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={inverted ? 'stroke-inverse' : 'stroke-on-primary'} />
      </svg>
      <span lang="en" dir="ltr" className="text-xl font-semibold tracking-tight">{t('app.name')}</span>
    </Link>
  )
}
