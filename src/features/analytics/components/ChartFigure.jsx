import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/Card.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * The frame every chart uses (NFR-44, PRD §3 Accessibility):
 * - the drawing itself is hidden from assistive technology (its hover tooltip
 *   only helps mouse users);
 * - a visible one-sentence summary says what the chart shows;
 * - "Show as table" opens the same numbers as a real table, for keyboard and
 *   screen-reader users and for anyone who wants exact values.
 */
export function ChartFigure({ title, description, legend, summary, table, children }) {
  const { t } = useI18n()

  return (
    <Card title={title} description={description}>
      <figure>
        {legend}
        <div aria-hidden="true" className="mt-4">
          {children}
        </div>
        <figcaption className="mt-4 text-ink-2">{summary}</figcaption>
      </figure>
      <details className="group mt-4 border-t border-line pt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md py-1 text-sm font-medium text-pine-700 [&::-webkit-details-marker]:hidden">
          {t('charts.showTable')}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 overflow-x-auto">{table}</div>
      </details>
    </Card>
  )
}

/**
 * Holds one Recharts drawing. SVG text follows the page direction, and in RTL
 * that flips what `text-anchor` means, so axis labels would grow into the plot.
 * The drawing is therefore always laid out LTR; the charts mirror themselves for
 * Arabic through their axis settings (directionProps in chartTheme.js).
 */
export function ChartCanvas({ children }) {
  return <div dir="ltr">{children}</div>
}

/** A swatch + label pair for chart legends. `swatch` is the class list of the small mark. */
export function LegendItem({ swatch, children }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className={`inline-block size-3.5 shrink-0 rounded-xs ${swatch}`} />
      {children}
    </li>
  )
}

/**
 * The hover box of a chart. Recharts passes `active` and `payload`; `render`
 * receives the hovered data row. Hover only adds convenience: every value is
 * also in the table.
 */
export function ChartTooltip({ active, payload, render }) {
  const { dir } = useI18n()
  if (!active || !payload?.length) return null
  return (
    // The drawing is LTR (ChartCanvas); the tooltip text follows the page language.
    <div
      dir={dir}
      className="rounded-md border border-line bg-surface px-3 py-2 text-start text-sm text-ink shadow-raised"
    >
      {render(payload[0].payload)}
    </div>
  )
}

/** A simple data table for the "Show as table" view. `rows` are arrays of cells; the first cell is the row header. */
export function ChartTable({ caption, columns, rows }) {
  return (
    <table className="w-full min-w-max text-start text-sm">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="border-b border-line text-ink-3">
          {columns.map((column) => (
            <th key={column} scope="col" className="py-2 pe-4 text-start font-medium">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map(([header, ...cells]) => (
          <tr key={header} className="border-b border-line last:border-0">
            <th scope="row" className="py-2 pe-4 text-start font-medium text-ink">
              {header}
            </th>
            {cells.map((cell, index) => (
              <td key={index} className="py-2 pe-4 text-ink-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
