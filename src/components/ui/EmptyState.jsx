import { cx } from '@/lib/cx.js'

/** Encouraging empty state: icon, title, one sentence, optional action (PRD tone). */
export function EmptyState({ icon: Icon, title, children, action, headingLevel = 'h2', className }) {
  const Heading = headingLevel
  return (
    <div className={cx('flex flex-col items-center px-6 py-10 text-center', className)}>
      {Icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-full bg-sunken text-ink-2">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      )}
      <Heading className="text-lg font-semibold text-ink">{title}</Heading>
      {children && <p className="mt-1.5 max-w-sm text-ink-2">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
