import { Award } from 'lucide-react'
import { Card } from '@/components/ui/Card.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Label–value pair: the label names the measure, so the number never needs a unit fragment. */
function Record({ label, count, caption }) {
  return (
    <div>
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-0.5">
        <span className="block text-3xl font-semibold text-ember-700 tabular-nums">{count}</span>
        <span className="text-sm text-ink-3">{caption}</span>
      </dd>
    </div>
  )
}

/**
 * Best day and best week by completed count (FR-33, BR-05). Ember marks
 * "you at your best". `day`/`week` are { count, date } with dates already formatted.
 */
export function PersonalBest({ day, week }) {
  const { t } = useI18n()

  return (
    <Card
      title={t('analytics.bestHeading')}
      description={t('analytics.bestDescription')}
      action={
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ember-50 text-ember-600">
          <Award aria-hidden="true" className="size-5" />
        </span>
      }
    >
      <dl className="flex flex-col gap-5">
        <Record label={t('analytics.bestDay')} count={day.count} caption={day.date} />
        <Record label={t('analytics.bestWeek')} count={week.count} caption={t('analytics.weekOf', { date: week.date })} />
      </dl>
      <p className="mt-5 border-t border-line pt-4 text-sm text-ink-3">{t('analytics.bestHint')}</p>
    </Card>
  )
}
