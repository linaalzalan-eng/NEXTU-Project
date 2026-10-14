import { useId } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * The Dashboard hero: today's rate as the one big number, the progress bar,
 * and the counts as a short sentence-like row (FR-21, FR-22).
 * `rate` is null when there are no tasks today (BR-06).
 */
export function TodaySummary({ completed, total, rate }) {
  const { t } = useI18n()
  const headingId = useId()
  const hasRate = rate !== null

  const counts = [
    { label: t('dashboard.done'), value: completed },
    { label: t('dashboard.left'), value: total - completed },
    { label: t('dashboard.planned'), value: total },
  ]

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-line bg-surface p-6 shadow-hairline lg:p-8"
    >
      <h2 id={headingId} className="text-sm font-medium text-ink-3">
        {t('dashboard.progressLabel')}
      </h2>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p dir="ltr" className="text-display font-semibold tracking-tight text-ink tabular-nums">
          {hasRate ? (
            <>
              {rate}
              <span className="text-3xl text-ink-3">%</span>
            </>
          ) : (
            t('common.noValue')
          )}
        </p>
        <p className="text-ink-2">{hasRate ? t('dashboard.rateCaption') : t('dashboard.noTasksValue')}</p>
      </div>

      <ProgressBar
        value={rate}
        label={t('dashboard.progressLabel')}
        emptyText={t('dashboard.noTasksValue')}
        className="mt-6"
      />

      <dl className="mt-6 flex [&>div+div]:ms-5 [&>div+div]:border-s [&>div+div]:border-line [&>div+div]:ps-5">
        {counts.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-sm text-ink-3">{label}</dt>
            <dd className="text-xl font-semibold text-ink tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
