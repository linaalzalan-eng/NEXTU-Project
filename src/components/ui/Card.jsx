import { useId } from 'react'
import { cx } from '@/lib/cx.js'

/**
 * A bordered panel. With a `title` it renders as a labelled <section> with an h2;
 * `action` sits at the end of the title row.
 */
export function Card({ title, description, action, className, children }) {
  const titleId = useId()
  const Tag = title ? 'section' : 'div'

  return (
    <Tag
      aria-labelledby={title ? titleId : undefined}
      className={cx('rounded-lg border border-line bg-surface p-5 shadow-hairline lg:p-6', className)}
    >
      {title && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-ink-3">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Tag>
  )
}
