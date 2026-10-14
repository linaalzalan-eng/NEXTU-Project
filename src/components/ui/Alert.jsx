import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cx } from '@/lib/cx.js'

const VARIANTS = {
  info: { icon: Info, box: 'border-line bg-sunken text-ink' },
  success: { icon: CircleCheck, box: 'border-pine-600/25 bg-pine-50 text-pine-700' },
  warning: { icon: TriangleAlert, box: 'border-warning-700/25 bg-warning-50 text-warning-700' },
  danger: { icon: CircleAlert, box: 'border-danger-600/25 bg-danger-50 text-danger-600' },
}

/** Inline status banner. Danger alerts use role="alert" so they are announced. */
export function Alert({ variant = 'info', icon, title, children, action, className }) {
  const { icon: DefaultIcon, box } = VARIANTS[variant]
  const Icon = icon ?? DefaultIcon

  return (
    <div
      role={variant === 'danger' ? 'alert' : undefined}
      className={cx('flex flex-wrap items-start gap-x-3 gap-y-2 rounded-lg border px-4 py-3 text-sm', box, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-[1.15rem] shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : undefined}>{children}</div>}
      </div>
      {/* Below the text on small screens, at the end of the row from sm. */}
      {action && <div className="w-full ps-7 sm:ms-auto sm:w-auto sm:self-center sm:ps-0">{action}</div>}
    </div>
  )
}
