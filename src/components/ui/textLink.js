import { cx } from '@/lib/cx.js'

const TONES = {
  pine: 'text-pine-700 decoration-pine-600/40 hover:decoration-pine-600',
  warning: 'text-warning-700 decoration-warning-700/40 hover:decoration-warning-700',
}

/** Inline text links are underlined, so they never rely on color alone (WCAG 1.4.1). */
export function textLink({ tone = 'pine', className } = {}) {
  return cx('rounded-sm font-medium underline underline-offset-4 transition-colors', TONES[tone], className)
}
