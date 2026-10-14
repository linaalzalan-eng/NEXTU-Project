import { useId } from 'react'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Shows the daily encouraging message (FR-23). The message itself is chosen by BR-13 (Phase 4). */
export function MotivationMessage({ message }) {
  const { t } = useI18n()
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-pine-50 p-6">
      <h2 id={headingId} className="text-sm font-medium text-pine-700">
        {t('dashboard.messageHeading')}
      </h2>
      <p className="mt-2 text-xl leading-snug font-medium text-ink">{message}</p>
    </section>
  )
}
