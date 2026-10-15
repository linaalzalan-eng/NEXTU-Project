import { Sprout } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { MotivationMessage } from '@/features/dashboard/components/MotivationMessage.jsx'
import { OverdueBanner } from '@/features/dashboard/components/OverdueBanner.jsx'
import { TodaySummary } from '@/features/dashboard/components/TodaySummary.jsx'
import { TaskList } from '@/features/tasks/components/TaskList.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { PreviewNotice } from './preview/PreviewNotice.jsx'
import { SAMPLE_TODAY } from './preview/sampleData.js'
import { usePreviewState } from './preview/usePreviewState.js'

const EMPTY_TODAY = { completed: 0, total: 0, rate: null, motivationKey: 'motivation.noTasks', overdueCount: 0, tasks: [] }

export default function DashboardPage() {
  const { t, formatDate } = useI18n()
  // Sample or empty preview data (D-22). Phase 4 (P4-T05) replaces this with useTasks() and lib/stats.js.
  const today = usePreviewState() === 'empty' ? EMPTY_TODAY : SAMPLE_TODAY

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
        title={t('dashboard.title')}
        lede={t('dashboard.lede')}
      />
      <PreviewNotice messageKey="preview.noticeDashboard" />

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <TodaySummary completed={today.completed} total={today.total} rate={today.rate} />

          <section aria-labelledby="today-tasks-heading">
            <h2 id="today-tasks-heading" className="mb-3 text-xl font-semibold text-ink">
              {t('dashboard.tasksHeading')}
            </h2>
            {today.tasks.length > 0 ? (
              <TaskList tasks={today.tasks} />
            ) : (
              <div className="rounded-lg border border-dashed border-line-strong">
                <EmptyState
                  icon={Sprout}
                  title={t('dashboard.emptyTitle')}
                  headingLevel="h3"
                  action={
                    <Link to="/tasks" className={buttonStyles()}>
                      {t('dashboard.emptyAction')}
                    </Link>
                  }
                >
                  {t('dashboard.emptyBody')}
                </EmptyState>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <MotivationMessage message={t(today.motivationKey)} />
          {today.overdueCount > 0 && <OverdueBanner count={today.overdueCount} />}
        </aside>
      </div>
    </>
  )
}
