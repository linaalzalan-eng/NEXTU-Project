import { Link } from 'react-router'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/**
 * The logo: a dashed circle (your past self) and a solid arc (today).
 * The wordmark stays Latin in both languages.
 */
export function BrandMark({ inverted = false, className }) {
  const { t } = useI18n()
  return (
    <Link
      to="/dashboard"
      className={cx('inline-flex items-center gap-2.5 rounded-md', inverted ? 'text-paper focus-visible:outline-paper' : 'text-ink', className)}
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
        <rect width="32" height="32" rx="8" className={inverted ? 'fill-paper' : 'fill-pine-600'} />
        <g fill="none" strokeWidth="2.5" className={inverted ? 'stroke-ink' : 'stroke-paper'}>
          <circle cx="16" cy="16" r="8.5" strokeDasharray="3 3" />
          <path d="M16 7.5a8.5 8.5 0 0 1 0 17" strokeLinecap="round" />
        </g>
      </svg>
      <span lang="en" dir="ltr" className="text-lg font-semibold tracking-tight">
        {t('app.name')}
      </span>
    </Link>
  )
}
