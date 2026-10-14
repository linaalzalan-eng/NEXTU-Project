import { Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/**
 * One task row. Display-only in Phase 2: the status mark becomes a real
 * checkbox, with edit and delete actions, in Phase 3 (US-07 to US-12).
 */
export function TaskItem({ task, meta }) {
  const { t } = useI18n()
  const completed = task.status === 'completed'

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <span
        aria-hidden="true"
        className={cx(
          'mt-1 grid size-5 shrink-0 place-items-center rounded-full',
          completed ? 'bg-pine-600 text-white' : 'border-2 border-line-strong',
        )}
      >
        {completed && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p dir="auto" className={cx('break-words', completed ? 'text-ink-3 line-through decoration-ink-3/60' : 'text-ink')}>
          {task.title}
        </p>
        {meta && <p className="mt-0.5 text-sm text-ink-3">{meta}</p>}
      </div>
      {/* The status is announced in words, not only shown by color and strike-through. */}
      <span className="sr-only">{completed ? t('task.completed') : t('task.pending')}</span>
    </li>
  )
}
