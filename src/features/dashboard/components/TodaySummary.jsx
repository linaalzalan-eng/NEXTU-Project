import { useId } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Daily progress remains derived by the page; this component only presents it. */
export function TodaySummary({ completed, remaining, total, rate }) {
  const { t } = useI18n()
  const headingId = useId()
  const hasRate = rate !== null
  const counts = [
    { label: t('dashboard.done'), value: completed },
    { label: t('dashboard.left'), value: remaining },
    { label: t('dashboard.planned'), value: total },
  ]

  return (
    <section aria-labelledby={headingId} className="min-w-0 rounded-lg border border-line bg-surface px-4 py-3 shadow-hairline md:px-5 md:py-4">
      <div className="grid items-center gap-3 sm:grid-cols-2 sm:gap-5">
        <div className="min-w-0">
          <h2 id={headingId} className="text-sm font-medium text-ink-2">{t('dashboard.progressLabel')}</h2>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p dir="ltr" className="text-[2.5rem] leading-tight font-semibold tracking-tight text-pine-700 tabular-nums">
              {hasRate ? <>{rate}<span className="ms-1 text-2xl font-medium text-ink-3">%</span></> : t('common.noValue')}
            </p>
            <p className="text-sm text-ink-2">{hasRate ? t('dashboard.rateCaption') : t('dashboard.noTasksValue')}</p>
          </div>
          <ProgressBar value={rate} label={t('dashboard.progressLabel')} emptyText={t('dashboard.noTasksValue')} className="mt-2" />
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:gap-3">
          {counts.map(({ label, value }, index) => (
            <div key={label} className={index === 0 ? 'min-w-0 rounded-md bg-pine-50 px-2 py-2 text-center sm:px-3' : 'min-w-0 rounded-md bg-sunken px-2 py-2 text-center sm:px-3'}>
              <dt className="text-sm text-ink-2">{label}</dt>
              <dd className="mt-1 text-2xl leading-snug font-semibold text-ink tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
