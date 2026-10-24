import { Plus, Sprout } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { Button } from '@/components/ui/Button.jsx'
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
  const [adding, setAdding] = useState(false)
  const formId = useId()
  const addButton = useRef(null)
  const formRegion = useRef(null)
  useEffect(() => {
    if (adding) formRegion.current?.querySelector('input')?.focus()
  }, [adding, today])
  const { tasks, busyIds, loadStatus, error, reload } = useTasks()
  const actions = useTaskActions()

  const stats = useMemo(() => getDailyStats(tasks, today), [tasks, today])
  const todayTasks = useMemo(() => sortTasks(selectTasksForDate(tasks, today)), [tasks, today])
  const overdueCount = useMemo(() => selectOverdue(tasks, today).length, [tasks, today])

  let content
  if (loadStatus === 'loading') {
    content = (
      <div className="flex flex-col gap-6">
        <TodaySummarySkeleton />
        <TaskListSkeleton />
      </div>
    )
  } else if (loadStatus === 'error') {
    content = <TasksLoadError error={error} onRetry={reload} />
  } else {
    content = (
      <div className="flex flex-col gap-4">
        <div className="grid items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <TodaySummary completed={stats.completed} remaining={stats.remaining} total={stats.total} rate={stats.rate} />
          <MotivationMessage completed={stats.completed} total={stats.total} message={t(getMotivationKey(stats))} />
        </div>
        <section aria-labelledby="today-tasks-heading" className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="today-tasks-heading" className="text-xl font-semibold text-ink">{t('dashboard.tasksHeading')}</h2>
            <Button ref={addButton} icon={Plus} aria-expanded={adding} aria-controls={adding ? formId : undefined} onClick={() => setAdding(value => !value)}>
              {t('dashboard.newTask')}
            </Button>
          </div>
          {adding && (
            <div id={formId} ref={formRegion} role="region" aria-label={t('dashboard.newTask')} onKeyDown={event => {
              if (event.key === 'Escape') { event.preventDefault(); setAdding(false); addButton.current?.focus() }
            }}>
              <TaskForm key={today} defaultDate={today} today={today} onCreate={actions.create} />
            </div>
          )}
          {todayTasks.length > 0 ? (
            <TaskList tasks={todayTasks} busyIds={busyIds} onToggle={actions.setCompleted} />
          ) : (
            <div className="rounded-lg border border-dashed border-line-strong">
              <EmptyState icon={Sprout} title={t('dashboard.emptyTitle')} headingLevel="h3" className="py-6">
                {t('dashboard.emptyBody')}
              </EmptyState>
            </div>
          )}
        </section>
        {overdueCount > 0 && <OverdueBanner count={overdueCount} />}
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
