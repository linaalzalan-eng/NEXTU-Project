import { cx } from '@/lib/cx.js'

// `not-disabled:` keeps hover off disabled buttons and still works on links.
const VARIANTS = {
  primary: 'bg-pine-600 text-white not-disabled:hover:bg-pine-700 not-disabled:active:bg-pine-700',
  secondary: 'border border-line-strong bg-surface text-ink not-disabled:hover:bg-sunken',
  ghost: 'text-ink-2 not-disabled:hover:bg-sunken not-disabled:hover:text-ink',
  danger: 'bg-danger-600 text-white not-disabled:hover:bg-danger-700',
}

const SIZES = {
  md: 'h-11 gap-2 px-4 text-sm',
  sm: 'h-9 gap-1.5 px-3 text-sm',
}

const ICON_ONLY_SIZES = { md: 'size-11', sm: 'size-9' }

/** Class names for the Button look. Also used to style a router <Link> as a button. */
export function buttonStyles({ variant = 'primary', size = 'md', iconOnly = false, className } = {}) {
  return cx(
    'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap',
    'transition-colors duration-150 select-none',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
    VARIANTS[variant],
    iconOnly ? ICON_ONLY_SIZES[size] : SIZES[size],
    className,
  )
}
