import { Link } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Shown for unknown routes (FR-41). */
export default function NotFoundPage() {
  const { t } = useI18n()

  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center">
      <title>{`${t('notFound.title')} · ${t('app.name')}`}</title>
      <p dir="ltr" className="text-display font-semibold tracking-tight text-ink-3 tabular-nums">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-ink lg:text-3xl">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-prose text-ink-2">{t('notFound.body')}</p>
      <Link to="/dashboard" className={buttonStyles({ className: 'mt-6' })}>
        {t('notFound.action')}
      </Link>
    </div>
  )
}
