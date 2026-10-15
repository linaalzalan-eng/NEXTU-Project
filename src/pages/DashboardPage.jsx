import { Sprout } from 'lucide-react'
import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { MotivationMessage } from '@/features/dashboard/components/MotivationMessage.jsx'
import { OverdueBanner } from '@/features/dashboard/components/OverdueBanner.jsx'
import { TodaySummary } from '@/features/dashboard/components/TodaySummary.jsx'
import { TodaySummarySkeleton } from '@/features/dashboard/components/TodaySummarySkeleton.jsx'
import { getMotivationKey } from '@/features/dashboard/lib/motivation.js'
import { TaskForm } from '@/features/tasks/components/TaskForm.jsx'
import { TaskList } from '@/features/tasks/components/TaskList.jsx'
import { TaskListSkeleton } from '@/features/tasks/components/TaskListSkeleton.jsx'
import { TasksLoadError } from '@/features/tasks/components/TasksLoadError.jsx'
import { selectOverdue, selectTasksForDate, sortTasks } from '@/features/tasks/lib/taskSelectors.js'
import { useTaskActions } from '@/features/tasks/useTaskActions.js'
import { useTasks } from '@/features/tasks/useTasks.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { getDailyStats } from '@/lib/stats.js'
import { useToday } from '@/lib/useToday.js'

/**
 * Today at a glance (FR-20 to FR-24, US-17, US-18). Everything is derived from
 * the task list in TasksProvider, so a toggle here or on the Tasks page updates
 * the counts, rate, progress bar, and message at once (BR-11).
 */
export default function DashboardPage() {
  const { t, formatDay } = useI18n()
  const today = useToday()
  const { tasks, busyIds, status, error, reload } = useTasks()
  const actions = useTaskActions()

  const stats = useMemo(() => getDailyStats(tasks, today), [tasks, today])
  const todayTasks = useMemo(() => sortTasks(selectTasksForDate(tasks, today)), [tasks, today])
  const overdueCount = useMemo(() => selectOverdue(tasks, today).length, [tasks, today])

  let content
  if (status === 'loading') {
    content = (
      <div className="flex flex-col gap-8 lg:w-2/3">
        <TodaySummarySkeleton />
        <TaskListSkeleton />
      </div>
    )
  } else if (status === 'error') {
    content = <TasksLoadError error={error} onRetry={reload} />
  } else {
    content = (
      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <TodaySummary completed={stats.completed} remaining={stats.remaining} total={stats.total} rate={stats.rate} />

          <section aria-labelledby="today-tasks-heading" className="flex flex-col gap-5">
            <h2 id="today-tasks-heading" className="text-xl font-semibold text-ink">
              {t('dashboard.tasksHeading')}
            </h2>
            {/* key: a new day starts with a fresh form whose date is the new today (BR-10). */}
            <TaskForm key={today} defaultDate={today} today={today} onCreate={actions.create} />
            {todayTasks.length > 0 ? (
              <TaskList tasks={todayTasks} busyIds={busyIds} onToggle={actions.toggle} />
            ) : (
              <div className="rounded-lg border border-dashed border-line-strong">
                <EmptyState icon={Sprout} title={t('dashboard.emptyTitle')} headingLevel="h3">
                  {t('dashboard.emptyBody')}
                </EmptyState>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <MotivationMessage message={t(getMotivationKey(stats))} />
          {overdueCount > 0 && <OverdueBanner count={overdueCount} />}
        </aside>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long' })}
        title={t('dashboard.title')}
        lede={t('dashboard.lede')}
      />
      {content}
    </>
  )
}
