import { CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { TaskList } from '@/features/tasks/components/TaskList.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { PreviewNotice } from './preview/PreviewNotice.jsx'
import { daysAgo, SAMPLE_OVERDUE, SAMPLE_TODAY } from './preview/sampleData.js'
import { usePreviewState } from './preview/usePreviewState.js'

// PRD F2: pending tasks first, then completed. Preview only: Phase 3 uses taskSelectors.sortTasks.
const STATUS_ORDER = { pending: 0, completed: 1 }

export default function TasksPage() {
  const { t, formatDate } = useI18n()
  // Phase 2: sample or empty preview data (D-22). Phase 3 replaces this with useTasks().
  const isEmpty = usePreviewState() === 'empty'
  const dayTasks = isEmpty ? [] : [...SAMPLE_TODAY.tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
  const overdue = isEmpty ? [] : SAMPLE_OVERDUE

  return (
    <>
      <PageHeader title={t('tasks.title')} lede={t('tasks.lede')} />
      <PreviewNotice />

      {/* DOM order = reading and focus order: overdue first. On desktop the grid
          places it in the end column without changing that order (WCAG 1.3.2). */}
      <div className="grid gap-8 lg:grid-cols-3">
        {overdue.length > 0 && (
          <section
            aria-labelledby="overdue-heading"
            className="rounded-lg border border-warning-700/25 bg-warning-50 p-4 lg:col-start-3 lg:row-start-1 lg:self-start"
          >
            <h2 id="overdue-heading" className="font-semibold text-warning-700">
              {t('tasks.overdueHeading', { count: overdue.length })}
            </h2>
            <p className="mt-1 text-sm text-warning-700">{t('tasks.overdueHint')}</p>
            <TaskList
              tasks={overdue}
              getMeta={(task) =>
                t('task.plannedFor', {
                  date: formatDate(daysAgo(task.daysAgo), { weekday: 'short', day: 'numeric', month: 'short' }),
                })
              }
              className="mt-4"
            />
          </section>
        )}

        <section aria-labelledby="day-heading" className="lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 id="day-heading" className="text-xl font-semibold text-ink">
              {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <span className="rounded-full bg-pine-50 px-2.5 py-0.5 text-sm font-medium text-pine-700">
              {t('tasks.todayChip')}
            </span>
          </div>
          {dayTasks.length > 0 ? (
            <TaskList tasks={dayTasks} />
          ) : (
            <div className="rounded-lg border border-dashed border-line-strong">
              <EmptyState icon={CalendarDays} title={t('tasks.emptyTitle')} headingLevel="h3">
                {t('tasks.emptyBody')}
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
