import { CalendarDays, CircleCheckBig, ListTodo } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { DateNavigator } from '@/features/tasks/components/DateNavigator.jsx'
import { DeleteTaskDialog } from '@/features/tasks/components/DeleteTaskDialog.jsx'
import { OverdueSection } from '@/features/tasks/components/OverdueSection.jsx'
import { StatusFilter } from '@/features/tasks/components/StatusFilter.jsx'
import { TaskEditDialog } from '@/features/tasks/components/TaskEditDialog.jsx'
import { TaskForm } from '@/features/tasks/components/TaskForm.jsx'
import { TaskList } from '@/features/tasks/components/TaskList.jsx'
import { TaskListSkeleton } from '@/features/tasks/components/TaskListSkeleton.jsx'
import { filterByStatus, selectOverdue, selectTasksForDate, sortTasks } from '@/features/tasks/lib/taskSelectors.js'
import { useTaskActions } from '@/features/tasks/useTaskActions.js'
import { useTasks } from '@/features/tasks/useTasks.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { useToday } from '@/lib/useToday.js'

// Empty-state copy when the day has tasks but the filter hides them all (US-15).
const FILTER_EMPTY = {
  pending: { icon: CircleCheckBig, title: 'tasks.emptyPendingTitle', body: 'tasks.emptyPendingBody' },
  completed: { icon: ListTodo, title: 'tasks.emptyCompletedTitle', body: 'tasks.emptyCompletedBody' },
}

/** Manage the tasks of any day (FR-10 to FR-17, US-07 to US-16). */
export default function TasksPage() {
  const { t, formatDay } = useI18n()
  const today = useToday()
  const { tasks, busyIds, status, error, reload } = useTasks()
  const actions = useTaskActions()
  // null means "today", so the view follows the date when a new day starts (BR-10).
  const [selectedDate, setSelectedDate] = useState(null)
  const [filter, setFilter] = useState('all')
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const dayHeadingRef = useRef(null)
  const date = selectedDate ?? today

  const dayTasks = useMemo(() => sortTasks(selectTasksForDate(tasks, date)), [tasks, date])
  const visibleTasks = useMemo(() => filterByStatus(dayTasks, filter), [dayTasks, filter])
  const overdue = useMemo(() => selectOverdue(tasks, today), [tasks, today])

  const sameYear = date.slice(0, 4) === today.slice(0, 4)
  const dayLabel = formatDay(date, { weekday: 'long', day: 'numeric', month: 'long', ...(!sameYear && { year: 'numeric' }) })

  // When an action removes the focused row from view (delete, reschedule, move to
  // today, completing an overdue task, or toggling under a status filter), keep
  // keyboard focus nearby instead of letting it fall back to the top of the page.
  function focusDayHeading() {
    requestAnimationFrame(() => dayHeadingRef.current?.focus())
  }

  function toggleDayTask(task, completed) {
    actions.toggle(task, completed)
    if (filter !== 'all') focusDayHeading()
  }

  function toggleOverdueTask(task, completed) {
    actions.toggle(task, completed)
    focusDayHeading()
  }

  let content
  if (status === 'loading') {
    content = <TaskListSkeleton />
  } else if (status === 'error') {
    content = (
      <Alert
        variant="danger"
        title={t('tasks.loadError')}
        action={
          <Button variant="secondary" size="sm" onClick={reload}>
            {t('common.retry')}
          </Button>
        }
      >
        {t(errorMessageKey(error))}
      </Alert>
    )
  } else {
    const filterEmpty = FILTER_EMPTY[filter]
    content = (
      // DOM order = reading and focus order: overdue first. On desktop the grid
      // places it in the end column without changing that order (WCAG 1.3.2).
      <div className="grid gap-8 lg:grid-cols-3">
        <OverdueSection
          tasks={overdue}
          busyIds={busyIds}
          onToggle={toggleOverdueTask}
          onMoveToToday={(task) => {
            actions.moveToToday(task, today)
            focusDayHeading()
          }}
          className="lg:col-start-3 lg:row-start-1 lg:self-start"
        />
        <section aria-labelledby="day-heading" className="flex flex-col gap-5 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <DateNavigator date={date} today={today} onChange={(next) => setSelectedDate(next === today ? null : next)} />
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="day-heading" ref={dayHeadingRef} tabIndex={-1} className="text-xl font-semibold text-ink">
              {dayLabel}
            </h2>
            {date === today && (
              <span className="rounded-full bg-pine-50 px-2.5 py-0.5 text-sm font-medium text-pine-700">
                {t('tasks.todayChip')}
              </span>
            )}
          </div>
          <TaskForm key={date} defaultDate={date} today={today} onCreate={actions.create} />
          {dayTasks.length > 0 && <StatusFilter value={filter} onChange={setFilter} />}
          {visibleTasks.length > 0 ? (
            <TaskList
              tasks={visibleTasks}
              busyIds={busyIds}
              onToggle={toggleDayTask}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-line-strong">
              {dayTasks.length > 0 && filterEmpty ? (
                <EmptyState icon={filterEmpty.icon} title={t(filterEmpty.title)} headingLevel="h3">
                  {t(filterEmpty.body)}
                </EmptyState>
              ) : (
                <EmptyState icon={CalendarDays} title={t('tasks.emptyTitle')} headingLevel="h3">
                  {t('tasks.emptyBody')}
                </EmptyState>
              )}
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <>
      <PageHeader title={t('tasks.title')} lede={t('tasks.lede')} />
      {content}
      <TaskEditDialog
        task={editingTask}
        today={today}
        onSave={async (task, changes) => {
          await actions.update(task, changes)
          if (changes.taskDate) focusDayHeading()
        }}
        onClose={() => setEditingTask(null)}
      />
      <DeleteTaskDialog
        task={deletingTask}
        onConfirm={(task) => {
          actions.remove(task)
          focusDayHeading()
        }}
        onClose={() => setDeletingTask(null)}
      />
    </>
  )
}
