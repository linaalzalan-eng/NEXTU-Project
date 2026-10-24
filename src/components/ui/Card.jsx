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
      className={cx('min-w-0 rounded-lg border border-line bg-surface p-5 shadow-hairline md:p-6', className)}
    >
      {title && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm leading-relaxed text-ink-2">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </Tag>
  )
}
