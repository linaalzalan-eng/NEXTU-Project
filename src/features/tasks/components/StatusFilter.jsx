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
      className="inline-flex max-w-full flex-wrap self-start gap-1 rounded-md border border-line bg-sunken p-1"
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
              'min-h-11 rounded-md px-3 text-sm font-medium transition-colors duration-150 sm:px-4',
              active ? 'bg-surface text-pine-700 shadow-hairline' : 'text-ink-2 hover:bg-sunken hover:text-ink',
            )}
          >
            {t(`filter.${status}`)}
          </button>
        )
      })}
    </div>
  )
}
