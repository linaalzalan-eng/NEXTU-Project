import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { STATUS_FILTERS } from '../lib/taskSelectors.js'

/** All / Pending / Completed (FR-13, US-15). The active button has aria-pressed="true". */
export function StatusFilter({ value, onChange }) {
  const { t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('filter.label')}
      className="inline-flex self-start overflow-hidden rounded-md border border-line-strong bg-surface"
    >
      {STATUS_FILTERS.map((status) => {
        const active = status === value
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={cx(
              'h-11 border-s border-line-strong px-4 text-sm font-medium transition-colors duration-150 first:border-s-0',
              active ? 'bg-pine-50 text-pine-700' : 'text-ink-2 hover:bg-sunken hover:text-ink',
            )}
          >
            {t(`filter.${status}`)}
          </button>
        )
      })}
    </div>
  )
}
