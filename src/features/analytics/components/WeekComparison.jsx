import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/Card.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/** "+3", "−2", or "0", using a real minus sign. */
function signed(value) {
  if (value > 0) return `+${value}`
  if (value < 0) return `−${Math.abs(value)}`
  return '0'
}

/**
 * One week row. The present week is a solid pine bar; the past week is the
 * dashed "ghost" outline (DESIGN_SYSTEM §1). The bar is decorative: the same
 * numbers are written as text next to it.
 */
function WeekRow({ label, week, ghost }) {
  const { t, formatDay } = useI18n()
  const hasRate = week.rate !== null
  const day = (date) => formatDay(date, { day: 'numeric', month: 'short' })
  // One day (today is Saturday) is shown as a single date, not "Sat – Sat".
  const range = week.from === week.to ? day(week.from) : t('analytics.range', { from: day(week.from), to: day(week.to) })

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <p className={cx('font-medium', ghost ? 'text-ink-2' : 'text-ink')}>
          {label}
          <span className="block text-sm font-normal text-ink-3">{range}</span>
        </p>
        <p className="text-sm text-ink-2">
          {t('analytics.completedOf', { completed: week.completed, total: week.total })}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <span dir="ltr" className="font-semibold text-ink tabular-nums">
            {hasRate ? `${week.rate}%` : t('common.noValue')}
          </span>
        </p>
      </div>
      <div aria-hidden="true" className="mt-2 h-3 w-full rounded-full bg-sunken">
        {/* At 0% nothing is drawn (the dashed border alone would still show a sliver). */}
        {week.rate > 0 &&
          (ghost ? (
            <div className="h-full rounded-full border-2 border-dashed border-ink-2" style={{ width: `${week.rate}%` }} />
          ) : (
            <div className="h-full rounded-full bg-pine-600" style={{ width: `${week.rate}%` }} />
          ))}
      </div>
    </div>
  )
}

function Delta({ label, value }) {
  const { t } = useI18n()
  if (value === null) {
    return (
      <div>
        <dt className="text-sm text-ink-2">{label}</dt>
        <dd className="mt-1 text-ink-2">{t('analytics.notEnoughData')}</dd>
      </div>
    )
  }
  // Going down is shown calmly in ink, never in red: a lower week is information, not failure.
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus
  return (
    <div>
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="mt-1 flex items-center gap-2">
        {/* Time runs toward the end side, so in RTL trend arrows mirror to point that way. */}
        <Icon
          aria-hidden="true"
          className={cx('size-5 shrink-0 rtl:-scale-x-100', value > 0 ? 'text-pine-600' : 'text-ink-2')}
        />
        <bdi dir="ltr" className="text-3xl font-semibold text-ink tabular-nums">
          {signed(value)}
        </bdi>
      </dd>
    </div>
  )
}

/**
 * This week so far vs. the same days last week (FR-30, BR-02 to BR-04).
 * Takes the result of compareWeeksToDate() as props; it does no calculation itself.
 */
export function WeekComparison({ current, previous, completedDelta, rateDelta }) {
  const { t } = useI18n()

  return (
    <Card title={t('analytics.comparisonHeading')} description={t('analytics.comparisonHint')} className="h-full">
      <div className="flex flex-col gap-5">
        <WeekRow label={t('analytics.thisWeek')} week={current} />
        <WeekRow label={t('analytics.lastWeek')} week={previous} ghost />
      </div>
      <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <Delta label={t('analytics.deltaTasks')} value={completedDelta} />
        <Delta label={t('analytics.deltaRate')} value={rateDelta} />
      </dl>
    </Card>
  )
}
