import { useI18n } from '@/lib/i18n/useI18n.js'

/** Quiet placeholder rows while tasks load; the text is announced politely (USER_FLOW §9). */
export function TaskListSkeleton({ rows = 3 }) {
  const { t } = useI18n()
  return (
    <div role="status" className="rounded-lg border border-line bg-surface shadow-hairline">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center gap-4 border-line px-4 py-4 not-first:border-t">
          <span className="size-5 shrink-0 rounded-full bg-sunken motion-safe:animate-pulse" />
          <span className="h-4 flex-1 rounded-sm bg-sunken motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  )
}
