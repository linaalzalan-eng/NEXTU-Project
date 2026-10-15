import { Award, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Label–value pair: the label names the measure, so the number never needs a unit fragment. */
function Record({ label, count, caption }) {
  return (
    <div>
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-0.5">
        <span className="block text-3xl font-semibold text-ember-700">{count}</span>
        <span className="text-sm text-ink-3">{caption}</span>
      </dd>
    </div>
  )
}

/**
 * Best day and best week by completed count (FR-33, BR-05). Ember marks
 * "you at your best". When today or this week holds the record (matching it
 * counts), a short positive message is shown: a message, not a badge (US-21).
 */
export function PersonalBest({ bestDay, bestWeek, isTodayBest, isThisWeekBest }) {
  const { t, formatDay } = useI18n()
  const day = (date) => formatDay(date, { weekday: 'short', day: 'numeric', month: 'short' })
  const highlights = [isTodayBest && t('analytics.bestTodayNow'), isThisWeekBest && t('analytics.bestWeekNow')].filter(
    Boolean,
  )

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
      {bestDay && bestWeek ? (
        <>
          {highlights.length > 0 && (
            <div className="mb-5 flex gap-3 rounded-md bg-ember-50 p-3 text-ember-700">
              <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ember-600" />
              <div className="font-medium">
                {highlights.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </div>
            </div>
          )}
          <dl className="flex flex-col gap-5">
            <Record label={t('analytics.bestDay')} count={bestDay.completed} caption={day(bestDay.date)} />
            <Record
              label={t('analytics.bestWeek')}
              count={bestWeek.completed}
              caption={t('analytics.weekOf', { date: day(bestWeek.weekStart) })}
            />
          </dl>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-3">{t('analytics.bestHint')}</p>
        </>
      ) : (
        <p className="text-ink-2">{t('analytics.bestEmpty')}</p>
      )}
    </Card>
  )
}
