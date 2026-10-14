import { useI18n } from '@/lib/i18n/useI18n.js'

/** First focusable element on every page; visible only when focused. */
export function SkipLink() {
  const { t } = useI18n()
  return (
    <a
      href="#main"
      className="sr-only z-50 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
    >
      {t('common.skipToContent')}
    </a>
  )
}
