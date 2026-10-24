import { Moon, Sun } from 'lucide-react'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { useTheme } from '@/lib/theme/useTheme.js'
import { cx } from '@/lib/cx.js'

/** A native button keeps Enter/Space and focus behavior without a menu. */
export function ThemeSwitch({ compact = false, className }) {
  const { t } = useI18n()
  const { resolvedTheme, setTheme } = useTheme()
  const next = resolvedTheme === 'dark' ? 'light' : 'dark'
  const Icon = next === 'dark' ? Moon : Sun
  const label = `${t('theme.label')}: ${t('theme.switchTo', { theme: t(`theme.${next}`) })}`
  return (
    <button type="button" aria-label={label} title={label} onClick={() => setTheme(next)}
      className={cx('inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-line bg-surface text-sm font-medium text-ink-2 transition-colors hover:border-line-strong hover:bg-sunken hover:text-ink', compact ? 'w-11' : 'px-3', className)}>
      <Icon aria-hidden="true" className="size-5" />
      {!compact && <span>{t(`theme.${next}`)}</span>}
    </button>
  )
}
