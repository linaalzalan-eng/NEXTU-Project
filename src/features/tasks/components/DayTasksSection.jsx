import { CalendarDays, CircleCheckBig, ListTodo } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { filterByStatus } from '../lib/taskSelectors.js'
import { DateNavigator } from './DateNavigator.jsx'
import { StatusFilter } from './StatusFilter.jsx'
import { TaskForm } from './TaskForm.jsx'
import { TaskList } from './TaskList.jsx'

// Empty-state copy when the day has tasks but the filter hides them all (US-15).
const FILTER_EMPTY = {
  pending: { icon: CircleCheckBig, title: 'tasks.emptyPendingTitle', body: 'tasks.emptyPendingBody' },
  completed: { icon: ListTodo, title: 'tasks.emptyCompletedTitle', body: 'tasks.emptyCompletedBody' },
}

/**
 * The viewed day on the Tasks page (FR-10 to FR-15, US-07 to US-15): date navigation,
 * the day heading, quick add, the status filter, and the day's list or empty state.
 * `tasks` are the day's tasks, already sorted. `headingRef` lets the page move focus
 * to the heading; `onRowHidden` is called when a toggle hides the row under a filter.
 */
export function DayTasksSection({
  date,
  today,
  tasks,
  busyIds,
  headingRef,
  onDateChange,
  onCreate,
  onToggle,
  onEdit,
  onDelete,
  onRowHidden,
  className,
}) {
  const { t, formatDay } = useI18n()
  const headingId = useId()
  const [filter, setFilter] = useState('all')
  const visibleTasks = useMemo(() => filterByStatus(tasks, filter), [tasks, filter])

  const sameYear = date.slice(0, 4) === today.slice(0, 4)
  const dayLabel = formatDay(date, { weekday: 'long', day: 'numeric', month: 'long', ...(!sameYear && { year: 'numeric' }) })
  // Keep the filter visible while it is active, even on a day with no tasks, so a
  // new task hidden by it is never a mystery.
  const showFilter = tasks.length > 0 || filter !== 'all'

  function toggle(task, completed) {
    onToggle(task, completed)
    if (filter !== 'all') onRowHidden()
  }

  return (
    <section aria-labelledby={headingId} className={className}>
      <DateNavigator date={date} today={today} onChange={onDateChange} />
      <div className="flex flex-wrap items-center gap-3">
        <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-ink">
          {dayLabel}
        </h2>
        {date === today && (
          <span className="rounded-full bg-pine-50 px-2.5 py-0.5 text-sm font-medium text-pine-700">
            {t('tasks.todayChip')}
          </span>
        )}
      </div>
      <TaskForm key={date} defaultDate={date} today={today} onCreate={onCreate} />
      {showFilter && <StatusFilter value={filter} onChange={setFilter} />}
      {visibleTasks.length > 0 ? (
        <TaskList tasks={visibleTasks} busyIds={busyIds} onToggle={toggle} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <div className="rounded-lg border border-dashed border-line-strong">
          <DayEmptyState hasTasks={tasks.length > 0} filter={filter} />
        </div>
      )}
    </section>
  )
}

/** "Nothing planned", or a filter-specific message when the day has tasks (US-15). */
function DayEmptyState({ hasTasks, filter }) {
  const { t } = useI18n()
  const filterEmpty = hasTasks ? FILTER_EMPTY[filter] : undefined
  const { icon, title, body } = filterEmpty ?? { icon: CalendarDays, title: 'tasks.emptyTitle', body: 'tasks.emptyBody' }
  return (
    <EmptyState icon={icon} title={t(title)} headingLevel="h3">
      {t(body)}
    </EmptyState>
  )
}
