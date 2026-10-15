import { ChevronDown } from 'lucide-react'
import { useI18n } from '@/lib/i18n/useI18n.js'

const ITEM_KEYS = ['calcRate', 'calcWeek', 'calcCompare', 'calcCharts', 'calcBest', 'calcEmpty']

/** Plain-language explanation of the formulas (FR-34, PRD Philosophy principle 3). */
export function CalculationInfo() {
  const { t } = useI18n()

  return (
    <details className="group rounded-lg border border-line bg-surface shadow-hairline">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
        {t('analytics.calcSummary')}
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="flex list-disc flex-col gap-2 border-t border-line px-5 py-4 ps-10 text-ink-2 marker:text-ink-3">
        {ITEM_KEYS.map((key) => (
          <li key={key}>{t(`analytics.${key}`)}</li>
        ))}
      </ul>
    </details>
  )
}
