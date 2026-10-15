import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { ChartCanvas, ChartFigure, ChartTable, ChartTooltip, LegendItem } from './ChartFigure.jsx'
import { CHART_PROPS, COLORS, directionProps, GHOST_BAR, SERIES_PROPS, TICK_STYLE } from './chartTheme.js'

const HEIGHT = 240

/** The two weeks, past first. Each is a stack: completed at the bottom, planned-but-not-done on top. */
const STACKS = [
  { id: 'previous', completed: GHOST_BAR },
  { id: 'current', completed: { fill: COLORS.present } },
]

/** An x-axis label; today's weekday is set in bold ink so "now" is easy to find. */
function DayTick({ x, y, payload, todayLabel }) {
  const isToday = payload.value === todayLabel
  return (
    <text
      x={x}
      y={y + 14}
      textAnchor="middle"
      fontSize={12}
      fontWeight={isToday ? 600 : 400}
      fill={isToday ? COLORS.tickStrong : COLORS.tick}
    >
      {payload.value}
    </text>
  )
}

/**
 * Per-day completed and planned tasks for the current and previous FULL weeks,
 * Saturday to Friday (FR-31, US-19). Each day has two stacked columns: the
 * bottom part is completed, the light gray top part is planned but not done, so the
 * full height is the day's total. This week is solid pine; last week is the
 * dashed "ghost" (DESIGN_SYSTEM §1). Because these are full weeks, tasks planned
 * for later this week are included; the "so far" comparison is WeekComparison (BR-04).
 */
export function DailyChart({ currentWeek, previousWeek, today }) {
  const { t, dir, formatDay } = useI18n()
  const axes = directionProps(dir)
  // A day or week without tasks says so in words, never "0 of 0" (BR-06).
  const describe = (stats) => (stats.total === 0 ? t('charts.noTasks') : t('analytics.completedOf', stats))

  const rows = currentWeek.days.map((day, index) => {
    const previous = previousWeek.days[index]
    return {
      label: formatDay(day.date, { weekday: 'short' }),
      name: formatDay(day.date, { weekday: 'long' }),
      isToday: day.date === today,
      current: day,
      previous,
      currentCompleted: day.completed,
      currentRemaining: day.remaining,
      previousCompleted: previous.completed,
      previousRemaining: previous.remaining,
    }
  })
  const todayLabel = rows.find((row) => row.isToday)?.label

  return (
    <ChartFigure
      title={t('charts.dailyTitle')}
      description={t('charts.dailyDescription')}
      legend={
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
          <LegendItem swatch="bg-pine-600">{t('charts.thisWeekCompleted')}</LegendItem>
          <LegendItem swatch="border-[1.5px] border-dashed border-line-strong bg-surface">
            {t('charts.lastWeekCompleted')}
          </LegendItem>
          <LegendItem swatch="bg-line">{t('charts.plannedNotDone')}</LegendItem>
        </ul>
      }
      summary={t('charts.dailySummary', { current: describe(currentWeek), previous: describe(previousWeek) })}
      table={
        <ChartTable
          caption={t('charts.dailyTitle')}
          columns={[t('charts.day'), t('analytics.thisWeek'), t('charts.lastWeek')]}
          rows={rows.map((row) => [row.name, describe(row.current), describe(row.previous)])}
        />
      }
    >
      <ChartCanvas>
        <ResponsiveContainer width="100%" height={HEIGHT} initialDimension={{ width: 640, height: HEIGHT }}>
          <BarChart data={rows} barGap={4} margin={{ top: 8, right: 4, bottom: 4, left: 4 }} {...CHART_PROPS}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: COLORS.grid }}
              tick={<DayTick todayLabel={todayLabel} />}
              {...axes.xAxis}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} tick={TICK_STYLE} {...axes.yAxis} />
            <Tooltip
              cursor={{ fill: COLORS.cursor }}
              content={
                <ChartTooltip
                  render={(row) => (
                    <>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-ink-2">
                        {t('charts.labelValue', { label: t('analytics.thisWeek'), value: describe(row.current) })}
                      </p>
                      <p className="text-ink-2">
                        {t('charts.labelValue', { label: t('charts.lastWeek'), value: describe(row.previous) })}
                      </p>
                    </>
                  )}
                />
              }
            />
            {/* Past first, then present, in reading order: in RTL the pair is mirrored too. */}
            {(dir === 'rtl' ? [...STACKS].reverse() : STACKS).flatMap(({ id, completed }) => [
              <Bar
                key={`${id}Completed`}
                dataKey={`${id}Completed`}
                stackId={id}
                maxBarSize={20}
                {...completed}
                {...SERIES_PROPS}
              />,
              <Bar
                key={`${id}Remaining`}
                dataKey={`${id}Remaining`}
                stackId={id}
                maxBarSize={20}
                fill={COLORS.planned}
                radius={[3, 3, 0, 0]}
                {...SERIES_PROPS}
              />,
            ])}
          </BarChart>
        </ResponsiveContainer>
      </ChartCanvas>
    </ChartFigure>
  )
}
