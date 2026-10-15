import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { ChartCanvas, ChartFigure, ChartTable, ChartTooltip, LegendItem } from './ChartFigure.jsx'
import { CHART_PROPS, COLORS, directionProps, GHOST_BAR, SERIES_PROPS, TICK_STYLE } from './chartTheme.js'

const MARGIN = { top: 8, right: 8, bottom: 4, left: 8 }

/**
 * The last weeks' completed tasks and completion rate (FR-32, US-22).
 * Two measures with different scales get two small charts on the same week
 * axis, never one chart with two value axes. Earlier weeks are dashed "ghosts";
 * the current week is solid pine. Weeks without tasks stay as empty slots: no
 * column, and a gap in the rate line (BR-06). `summary` comes from
 * summarizeHistory() and is shown as the text alternative.
 */
export function TrendChart({ history, summary }) {
  const { t, dir, formatDay } = useI18n()
  const axes = directionProps(dir)
  const lastIndex = history.length - 1

  const rows = history.map((week, index) => ({
    label: formatDay(week.weekStart, { day: 'numeric', month: 'short' }),
    week,
    isCurrent: index === lastIndex,
    completed: week.completed,
    rate: week.rate,
  }))

  const summaryText = summary.strongest
    ? t('charts.trendSummary', {
        weeks: history.length,
        total: summary.totalCompleted,
        max: summary.strongest.completed,
        week: formatDay(summary.strongest.weekStart, { day: 'numeric', month: 'short' }),
      })
    : t('charts.trendSummaryEmpty', { weeks: history.length })

  const tooltip = (
    <ChartTooltip
      render={(row) => (
        <>
          <p className="font-medium">{t('analytics.weekOf', { date: row.label })}</p>
          <p className="text-ink-2">{t('analytics.completedOf', row.week)}</p>
          <p className="text-ink-2">
            {t('charts.labelValue', {
              label: t('charts.rate'),
              value: row.rate === null ? t('common.noValue') : `${row.rate}%`,
            })}
          </p>
        </>
      )}
    />
  )
  const xAxis = { dataKey: 'label', tickLine: false, axisLine: { stroke: COLORS.grid }, tick: TICK_STYLE, ...axes.xAxis }

  return (
    <ChartFigure
      title={t('charts.trendTitle', { weeks: history.length })}
      description={t('charts.trendDescription')}
      legend={
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
          <LegendItem swatch="bg-pine-600">{t('analytics.thisWeek')}</LegendItem>
          <LegendItem swatch="border-[1.5px] border-dashed border-line-strong bg-surface">
            {t('charts.earlierWeeks')}
          </LegendItem>
        </ul>
      }
      summary={summaryText}
      table={
        <ChartTable
          caption={t('charts.trendTitle', { weeks: history.length })}
          columns={[t('charts.weekStarting'), t('charts.completed'), t('charts.planned'), t('charts.rate')]}
          rows={rows.map((row) => [
            row.label,
            row.week.completed,
            row.week.total,
            row.rate === null ? t('common.noValue') : `${row.rate}%`,
          ])}
        />
      }
    >
      <h3 className="text-sm font-medium text-ink-2">{t('charts.completedPerWeek')}</h3>
      <ChartCanvas>
        <ResponsiveContainer width="100%" height={170} initialDimension={{ width: 640, height: 170 }}>
          <BarChart data={rows} margin={MARGIN} {...CHART_PROPS}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis {...xAxis} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={TICK_STYLE} {...axes.yAxis} />
            <Tooltip cursor={{ fill: COLORS.cursor }} content={tooltip} />
            <Bar dataKey="completed" maxBarSize={24} radius={[3, 3, 0, 0]} {...SERIES_PROPS}>
              {rows.map((row) => (
                <Cell key={row.week.weekStart} {...(row.isCurrent ? { fill: COLORS.present } : GHOST_BAR)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCanvas>

      <h3 className="mt-5 text-sm font-medium text-ink-2">{t('charts.ratePerWeek')}</h3>
      <ChartCanvas>
        <ResponsiveContainer width="100%" height={140} initialDimension={{ width: 640, height: 140 }}>
          <LineChart data={rows} margin={MARGIN} {...CHART_PROPS}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis {...xAxis} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              unit="%"
              tickLine={false}
              axisLine={false}
              width={40}
              tick={TICK_STYLE}
              {...axes.yAxis}
            />
            <Tooltip cursor={{ stroke: COLORS.grid }} content={tooltip} />
            <Line
              dataKey="rate"
              stroke={COLORS.present}
              strokeWidth={2}
              dot={{ r: 4, fill: COLORS.present, stroke: COLORS.surface, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: COLORS.present, stroke: COLORS.surface, strokeWidth: 2 }}
              connectNulls={false}
              {...SERIES_PROPS}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCanvas>
    </ChartFigure>
  )
}
