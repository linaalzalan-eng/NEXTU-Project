import { CircleAlert } from 'lucide-react'
import { useId } from 'react'
import { cx } from '@/lib/cx.js'

/** Text input with a visible label, optional hint, and an error linked through aria-describedby (NFR-42). */
export function Input({ id, label, hint, error, className, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'nextu-input h-12 w-full min-w-0 rounded-md border bg-field px-3.5 text-base text-ink transition-colors duration-150',
          'placeholder:text-ink-3 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger-600' : 'border-line-strong not-disabled:hover:border-ink-2',
        )}
        dir={props.type === 'date' ? 'ltr' : undefined}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-sm text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger-600">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
