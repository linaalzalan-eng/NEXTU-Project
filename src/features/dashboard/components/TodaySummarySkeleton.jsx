import { useI18n } from '@/lib/i18n/useI18n.js'

/** Quiet placeholder for the Dashboard hero while tasks load. */
export function TodaySummarySkeleton() {
  const { t } = useI18n()
  const block = 'rounded-sm bg-sunken motion-safe:animate-pulse'

  return (
    <div role="status" className="rounded-lg border border-line bg-surface p-6 shadow-hairline lg:p-8">
      <span className="sr-only">{t('common.loading')}</span>
      <div aria-hidden="true">
        <div className={`h-4 w-32 ${block}`} />
        <div className={`mt-4 h-14 w-40 ${block}`} />
        <div className={`mt-6 h-2.5 w-full rounded-full ${block}`} />
        <div className={`mt-6 h-10 w-56 ${block}`} />
      </div>
    </div>
  )
}
