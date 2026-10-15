import { cx } from '@/lib/cx.js'
import { buttonStyles } from './buttonStyles.js'
import { Spinner } from './Spinner.jsx'

/**
 * Accessible button. Icon-only buttons must pass `aria-label`.
 * `loading` keeps the button focusable and its width, shows a spinner, and ignores clicks.
 * `mirrorIcon` flips a direction-dependent icon (chevrons, arrows) in RTL.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconOnly = false,
  mirrorIcon = false,
  loading = false,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}) {
  function handleClick(event) {
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, iconOnly, className })}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : (
        Icon && <Icon aria-hidden="true" className={cx('size-[1.15em] shrink-0', mirrorIcon && 'rtl:-scale-x-100')} />
      )}
      {iconOnly ? null : children}
    </button>
  )
}
