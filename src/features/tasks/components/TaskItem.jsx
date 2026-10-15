import { Check, Pencil, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { isTempTask } from '../lib/taskSelectors.js'

/** The round mark: an empty ring when pending, a filled ring with a check when completed. */
const markClass = 'grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors'

/**
 * One task row (US-10 to US-12). The checkbox is a real <input type="checkbox">,
 * so Space toggles it and screen readers announce its state; its label is the title.
 * Completed tasks also get a strike-through and a check, not only a color (US-10).
 * Edit and Delete appear only when their handlers are passed. Without `onToggle`
 * the row is read-only (used by the Dashboard preview until Phase 4).
 * While the task is unsaved or `busy` (a request in flight), its controls are locked.
 * The checkbox uses aria-disabled instead of disabled, so keyboard focus stays on it.
 */
export function TaskItem({ task, meta, action, busy = false, onToggle, onEdit, onDelete }) {
  const { t } = useI18n()
  const checkboxId = useId()
  const completed = task.status === 'completed'
  const locked = busy || isTempTask(task)
  const titleClass = completed ? 'text-ink-3 line-through decoration-ink-3/60' : 'text-ink'
  // The title keeps its own direction (dir="auto" on an inline span), while the line
  // stays aligned to the UI's start side next to the checkbox: an English title in
  // the Arabic UI reads left to right but sits on the right.

  return (
    <li className="flex items-start gap-1 py-1.5 ps-1 pe-2">
      {onToggle ? (
        <span className="relative grid size-11 shrink-0 place-items-center">
          <input
            id={checkboxId}
            type="checkbox"
            checked={completed}
            aria-disabled={locked || undefined}
            onChange={(event) => {
              if (!locked) onToggle(task, event.target.checked)
            }}
            className="peer absolute inset-0 cursor-pointer appearance-none rounded-full aria-disabled:cursor-progress"
          />
          <span
            aria-hidden="true"
            className={cx(
              markClass,
              'pointer-events-none border-line-strong text-transparent',
              'peer-checked:border-pine-600 peer-checked:bg-pine-600 peer-checked:text-white peer-aria-disabled:opacity-50',
            )}
          >
            <Check className="size-3.5" strokeWidth={3} />
          </span>
        </span>
      ) : (
        <span className="grid size-11 shrink-0 place-items-center">
          <span
            aria-hidden="true"
            className={cx(markClass, completed ? 'border-pine-600 bg-pine-600 text-white' : 'border-line-strong')}
          >
            {completed && <Check className="size-3.5" strokeWidth={3} />}
          </span>
        </span>
      )}

      <div className="min-w-0 flex-1 py-2.5">
        {onToggle ? (
          <label htmlFor={checkboxId} className="block cursor-pointer break-words">
            <span dir="auto" className={titleClass}>
              {task.title}
            </span>
          </label>
        ) : (
          <p className="break-words">
            <span dir="auto" className={titleClass}>
              {task.title}
            </span>
          </p>
        )}
        {meta && <p className="mt-0.5 text-sm text-ink-3">{meta}</p>}
        {action && <div className="mt-2">{action}</div>}
        {/* Read-only rows have no checkbox to announce the state, so say it in words. */}
        {!onToggle && <span className="sr-only">{completed ? t('task.completed') : t('task.pending')}</span>}
      </div>

      {onEdit && (
        <Button
          variant="ghost"
          icon={Pencil}
          iconOnly
          aria-label={t('task.edit', { title: task.title })}
          disabled={locked}
          onClick={() => onEdit(task)}
        />
      )}
      {onDelete && (
        <Button
          variant="ghost"
          icon={Trash2}
          iconOnly
          aria-label={t('task.delete', { title: task.title })}
          disabled={locked}
          onClick={() => onDelete(task)}
        />
      )}
    </li>
  )
}
