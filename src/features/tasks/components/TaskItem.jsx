import { Check, Pencil, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'

/** The round mark: an empty ring when pending, a filled ring with a check when completed. */
const markClass = 'grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors'

/**
 * One task row (US-10 to US-12). The checkbox is a real <input type="checkbox">,
 * so Space toggles it and screen readers announce its state; its label is the title.
 * Completed tasks also get a strike-through and a check, not only a color (US-10).
 * Edit and Delete appear only when their handlers are passed (the Dashboard
 * shows only the checkbox, PRD F3).
 * While `locked` (unsaved, or a request in flight; see isTaskLocked), its controls are blocked.
 * The checkbox uses aria-disabled instead of disabled, so keyboard focus stays on it.
 */
export function TaskItem({ task, meta, action, locked = false, onToggle, onEdit, onDelete }) {
  const { t } = useI18n()
  const checkboxId = useId()
  const completed = task.status === 'completed'
  const titleClass = completed ? 'text-ink-3 line-through decoration-ink-3/60' : 'text-ink'
  // The title keeps its own direction (dir="auto" on an inline span), while the line
  // stays aligned to the UI's start side next to the checkbox: an English title in
  // the Arabic UI reads left to right but sits on the right.

  return (
    <li className="flex items-start gap-1 py-1.5 ps-1 pe-2">
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

      <div className="min-w-0 flex-1 py-2.5">
        <label htmlFor={checkboxId} className="block cursor-pointer break-words">
          <span dir="auto" className={titleClass}>
            {task.title}
          </span>
        </label>
        {meta && <p className="mt-0.5 text-sm text-ink-3">{meta}</p>}
        {action && <div className="mt-2">{action}</div>}
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
