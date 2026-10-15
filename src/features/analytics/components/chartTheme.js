/**
 * Shared Recharts settings, so both charts follow DESIGN_SYSTEM.md.
 * Colors are the design tokens from index.css, read through CSS variables,
 * so the charts can never drift from the rest of the UI.
 *
 * The "past self" motif (DESIGN_SYSTEM §1): the present is a solid pine fill,
 * the past a dashed outline (the "ghost"). Pine against the gray outline was
 * checked with the dataviz palette validator (colour-blind separation and 3:1 contrast).
 */
export const COLORS = {
  present: 'var(--color-pine-600)',
  ghostStroke: 'var(--color-line-strong)',
  ghostFill: 'var(--color-surface)',
  planned: 'var(--color-line)',
  grid: 'var(--color-line)',
  tick: 'var(--color-ink-3)',
  tickStrong: 'var(--color-ink)',
  cursor: 'var(--color-paper)',
  surface: 'var(--color-surface)',
}

/** The dashed outline of a "ghost" (past) bar. */
export const GHOST_BAR = { fill: COLORS.ghostFill, stroke: COLORS.ghostStroke, strokeWidth: 1.5, strokeDasharray: '4 3' }

export const TICK_STYLE = { fill: COLORS.tick, fontSize: 12 }

/**
 * Axis settings that depend on the reading direction. In RTL time runs from
 * right to left, so the x axis is reversed and the value axis moves to the right.
 */
export function directionProps(dir) {
  const rtl = dir === 'rtl'
  return { xAxis: { reversed: rtl }, yAxis: { orientation: rtl ? 'right' : 'left' } }
}

/**
 * Settings shared by every chart:
 * - no animation (calm motion, DESIGN_SYSTEM §1, and prefers-reduced-motion);
 * - Recharts' keyboard layer is off because the drawing is hidden from assistive
 *   technology; the same numbers are in the summary and the table (ChartFigure).
 */
export const CHART_PROPS = { accessibilityLayer: false }
export const SERIES_PROPS = { isAnimationActive: false }
