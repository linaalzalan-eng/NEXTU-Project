import { cx } from '@/lib/cx.js'

/**
 * Accessible progress bar (NFR-44). `value` is 0–100, or null when there is no data (BR-06):
 * then the track stays empty and `emptyText` is announced instead of a number.
 */
export function ProgressBar({ value, label, emptyText, className }) {
  const hasValue = value !== null && value !== undefined

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={hasValue ? value : undefined}
      aria-valuetext={hasValue ? `${value}%` : emptyText}
      className={cx('h-2.5 w-full overflow-hidden rounded-full bg-pine-50', className)}
    >
      {hasValue && (
        <div
          className="h-full rounded-full bg-pine-600 transition-[width] duration-150 ease-out"
          style={{ width: `${value}%` }}
        />
      )}
    </div>
  )
}
