import { ChartNoAxesColumn, Info } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { Alert } from '@/components/ui/Alert.jsx'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { CalculationInfo } from '@/features/analytics/components/CalculationInfo.jsx'
import { PersonalBest } from '@/features/analytics/components/PersonalBest.jsx'
import { WeekComparison } from '@/features/analytics/components/WeekComparison.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { PreviewNotice } from './preview/PreviewNotice.jsx'
import { daysAgo, SAMPLE_BEST, SAMPLE_WEEK } from './preview/sampleData.js'
import { usePreviewState } from './preview/usePreviewState.js'

/** Lazy-loaded route (NFR-03). */
export default function AnalyticsPage() {
  const { t, formatDate } = useI18n()
  // Phase 2: sample or empty preview data (D-22). Phase 4 computes these with lib/ functions.
  const isEmpty = usePreviewState() === 'empty'
  const shortDate = (date) => formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <>
      <PageHeader eyebrow={t('analytics.eyebrow')} title={t('analytics.title')} lede={t('analytics.lede')} />
      <PreviewNotice messageKey="preview.noticeAnalytics" />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-line-strong">
          <EmptyState
            icon={ChartNoAxesColumn}
            title={t('analytics.emptyTitle')}
            action={
              <Link to="/tasks" className={buttonStyles()}>
                {t('analytics.emptyAction')}
              </Link>
            }
          >
            {t('analytics.emptyBody')}
          </EmptyState>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:gap-8">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <WeekComparison {...SAMPLE_WEEK} />
            </div>
            <PersonalBest
              day={{ count: SAMPLE_BEST.day.count, date: shortDate(daysAgo(SAMPLE_BEST.day.daysAgo)) }}
              week={{ count: SAMPLE_BEST.week.count, date: shortDate(daysAgo(SAMPLE_BEST.week.daysAgo)) }}
            />
          </div>
          <Alert icon={Info}>{t('analytics.chartsNote')}</Alert>
          <CalculationInfo />
        </div>
      )}
    </>
  )
}
