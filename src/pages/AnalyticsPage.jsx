import { ChartNoAxesColumn } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { PageLoader } from '@/components/layout/PageLoader.jsx'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { CalculationInfo } from '@/features/analytics/components/CalculationInfo.jsx'
import { DailyChart } from '@/features/analytics/components/DailyChart.jsx'
import { PersonalBest } from '@/features/analytics/components/PersonalBest.jsx'
import { TrendChart } from '@/features/analytics/components/TrendChart.jsx'
import { WeekComparison } from '@/features/analytics/components/WeekComparison.jsx'
import { useAnalytics } from '@/features/analytics/useAnalytics.js'
import { TasksLoadError } from '@/features/tasks/components/TasksLoadError.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * You vs. your previous self (FR-30 to FR-34, US-19 to US-22). Lazy-loaded, so
 * Recharts is downloaded only when this page opens (NFR-03). Every number comes
 * from useAnalytics(), which computes it from the current tasks (BR-11).
 */
export default function AnalyticsPage() {
  const { t } = useI18n()
  const { loadStatus, error, reload, today, hasTasks, comparison, currentWeek, previousWeek, history, historySummary, best } =
    useAnalytics()

  let content
  if (loadStatus === 'loading') {
    content = <PageLoader />
  } else if (loadStatus === 'error') {
    content = <TasksLoadError error={error} onRetry={reload} />
  } else if (!hasTasks) {
    content = (
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
    )
  } else {
    content = (
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <WeekComparison {...comparison} />
          </div>
          <PersonalBest {...best} />
        </div>
        <DailyChart currentWeek={currentWeek} previousWeek={previousWeek} today={today} />
        <TrendChart history={history} summary={historySummary} />
        <CalculationInfo />
      </div>
    )
  }

  return (
    <>
      <PageHeader eyebrow={t('analytics.eyebrow')} title={t('analytics.title')} lede={t('analytics.lede')} />
      {content}
    </>
  )
}
