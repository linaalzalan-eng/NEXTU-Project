import { ArrowUpRight, CalendarCheck2, Check, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n/useI18n.js'

// Illustrative values only: seven daily counts total 21, including today's 8/10.
const WEEK = [1, 2, 3, 2, 3, 2, 8]
const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']

export function AuthProductPreview() {
  const { t } = useI18n()
  return (
    <section aria-label={t('auth.preview.label')} className="w-full rounded-xl border border-line bg-surface p-5 text-ink shadow-overlay xl:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-md bg-pine-50 text-pine-700"><CalendarCheck2 aria-hidden="true" className="size-[1.1rem]" /></span><p className="text-sm font-semibold">{t('auth.preview.title')}</p></div>
        <span className="rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-medium text-ink-3">{t('auth.preview.sample')}</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-ink-2">{t('auth.preview.disclaimer')}</p>
      <p className="text-xs font-medium text-ink-3">{t('auth.preview.today')}</p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <p dir="ltr" className="text-[2.75rem] leading-tight font-semibold tracking-tight">80<span className="ms-0.5 text-xl font-medium text-ink-3">%</span></p>
        <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-pine-700"><Check aria-hidden="true" className="size-3.5" />{t('auth.preview.dailyCount')}</span>
      </div>
      <div aria-hidden="true" className="mt-3 h-2 overflow-hidden rounded-full bg-sunken"><div className="h-full w-4/5 rounded-full bg-pine-600" /></div>
      <div className="mt-6 flex items-baseline justify-between gap-3"><p className="text-xs font-medium text-ink-3">{t('auth.preview.week')}</p><p className="text-xs text-ink-2"><b className="font-semibold text-ink">21</b> {t('auth.preview.completed')}</p></div>
      <div aria-hidden="true" className="mt-3 grid grid-cols-7 gap-2">
        {WEEK.map((count, index) => <div key={DAYS[index]} className="flex flex-col items-center gap-2"><div className="flex h-14 w-full items-end"><span className={`block w-full rounded-t-sm ${index === 6 ? 'bg-pine-600' : 'bg-pine-50'}`} style={{ height: `${count / 8 * 100}%` }} /></div><span className="text-[0.6875rem] text-ink-3">{t(`auth.preview.days.${DAYS[index]}`)}</span></div>)}
      </div>
      <div className="mt-5 flex items-center gap-2.5 rounded-lg bg-pine-50 px-3 py-3 text-pine-700"><TrendingUp aria-hidden="true" className="size-[1.1rem] shrink-0 rtl:-scale-x-100" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold">{t('auth.preview.growth')}</p><p className="mt-0.5 text-xs text-ink-2">{t('auth.preview.comparison')}</p></div><ArrowUpRight aria-hidden="true" className="size-4 shrink-0 rtl:-scale-x-100" /></div>
    </section>
  )
}
