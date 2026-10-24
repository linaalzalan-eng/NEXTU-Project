import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button.jsx'
import { addDays, isValidDateString } from '@/lib/dates.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { getTaskDateRange } from '../lib/taskValidation.js'

/**
 * Changes the viewed day (FR-12, US-14): previous, next, a date picker, and Today.
 * The chevrons follow the reading direction: in RTL "previous" points right.
 * The range matches the dates a task may have (BR-14).
 */
export function DateNavigator({ date, today, onChange }) {
  const { t } = useI18n()
  const range = getTaskDateRange(today)
  const previous = addDays(date, -1)
  const next = addDays(date, 1)

  return (
    <div role="group" aria-label={t('dateNav.label')} className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        icon={ChevronLeft}
        iconOnly
        mirrorIcon
        aria-label={t('dateNav.previous')}
        disabled={previous < range.min}
        onClick={() => onChange(previous)}
      />
      <input
        type="date"
        dir="ltr"
        aria-label={t('dateNav.pick')}
        value={date}
        min={range.min}
        max={range.max}
        onChange={(event) => {
          // An incomplete date (while typing, or cleared) or one outside BR-14 is ignored.
          const value = event.target.value
          if (isValidDateString(value) && value >= range.min && value <= range.max) onChange(value)
        }}
        className="h-11 min-w-0 max-w-full flex-1 rounded-md border border-line-strong bg-field px-2 text-sm sm:flex-none sm:px-3 text-ink transition-colors hover:border-ink-2"
      />
      <Button
        variant="secondary"
        icon={ChevronRight}
        iconOnly
        mirrorIcon
        aria-label={t('dateNav.next')}
        disabled={next > range.max}
        onClick={() => onChange(next)}
      />
      <Button variant="secondary" disabled={date === today} onClick={() => onChange(today)}>
        {t('dateNav.today')}
      </Button>
    </div>
  )
}
