import { useI18n } from '@/lib/i18n/useI18n.js'

/** Quiet placeholder for the Dashboard hero while tasks load. */
export function TodaySummarySkeleton() {
  const { t } = useI18n()
  const block = 'rounded-sm bg-sunken motion-safe:animate-pulse'

  return (
    <div role="status" className="rounded-lg border border-line bg-surface px-4 py-3 shadow-hairline md:px-5 md:py-4">
      <span className="sr-only">{t('common.loading')}</span>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
        <div>
        <div className={`h-4 w-32 ${block}`} />
        <div className={`mt-2 h-10 w-40 ${block}`} />
        <div className={`mt-2 h-2.5 w-full rounded-full ${block}`} />
        </div>
        <div className={`h-20 w-full self-center ${block}`} />
      </div>
    </div>
  )
}
