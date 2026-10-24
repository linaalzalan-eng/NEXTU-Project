import { useId, useState } from 'react'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { getMotivationKey } from '../lib/motivation.js'

const EXPRESSIONS = { 'motivation.noTasks': '🌱', 'motivation.zero': '🌱', 'motivation.started': '😊', 'motivation.close': '💪', 'motivation.done': '🎉' }

/** Lightweight Buddy: presentation of actual daily counts, never a separate score. */
export function MotivationMessage({ message, completed = 0, total = 0 }) {
  const { t } = useI18n()
  const headingId = useId()
  const [greeting, setGreeting] = useState(0)
  const emoji = EXPRESSIONS[getMotivationKey({ completed, total })]
  return (
    <section aria-labelledby={headingId} className="flex items-center gap-3 rounded-lg border border-pine-600/15 bg-pine-50 px-4 py-3">
      <button type="button" aria-label={t('dashboard.buddyAction')} onClick={() => setGreeting(value => value + 1)}
        className="grid size-14 shrink-0 place-items-center rounded-full transition-colors hover:bg-surface/50">
        <span key={`${completed}:${greeting}`} aria-hidden="true" className="nextu-buddy-pop inline-block text-4xl leading-none">{emoji}</span>
      </button>
      <div className="min-w-0">
        <h2 id={headingId} className="text-sm font-semibold text-pine-700">{t('dashboard.messageHeading')}</h2>
        <p aria-live="polite" aria-atomic="true" className="mt-1 text-sm leading-relaxed text-ink">{message}</p>
      </div>
    </section>
  )
}
