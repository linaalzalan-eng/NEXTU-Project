import { useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { DayTasksSection } from '@/features/tasks/components/DayTasksSection.jsx'
import { DeleteTaskDialog } from '@/features/tasks/components/DeleteTaskDialog.jsx'
import { OverdueSection } from '@/features/tasks/components/OverdueSection.jsx'
import { TaskEditDialog } from '@/features/tasks/components/TaskEditDialog.jsx'
import { TaskListSkeleton } from '@/features/tasks/components/TaskListSkeleton.jsx'
import { TasksLoadError } from '@/features/tasks/components/TasksLoadError.jsx'
import { selectOverdue, selectTasksForDate, sortTasks } from '@/features/tasks/lib/taskSelectors.js'
import { useTaskActions } from '@/features/tasks/useTaskActions.js'
import { useTasks } from '@/features/tasks/useTasks.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { useToday } from '@/lib/useToday.js'

/**
 * Manage the tasks of any day (FR-10 to FR-17, US-07 to US-16). The page wires the
 * data to the overdue list, the day section (DayTasksSection), and the two dialogs.
 */
export default function TasksPage() {
  const { t } = useI18n()
  const today = useToday()
  const { tasks, busyIds, loadStatus, error, reload } = useTasks()
  const actions = useTaskActions()
  // null means "today", so the view follows the date when a new day starts (BR-10).
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const dayHeadingRef = useRef(null)
  const date = selectedDate ?? today

  const dayTasks = useMemo(() => sortTasks(selectTasksForDate(tasks, date)), [tasks, date])
  const overdue = useMemo(() => selectOverdue(tasks, today), [tasks, today])

  // When an action removes the focused row from view (delete, reschedule, move to
  // today, completing an overdue task, or toggling under a status filter), keep
  // keyboard focus nearby instead of letting it fall back to the top of the page.
  function focusDayHeading() {
    requestAnimationFrame(() => dayHeadingRef.current?.focus())
  }

  let content
  if (loadStatus === 'loading') {
    content = <TaskListSkeleton />
  } else if (loadStatus === 'error') {
    content = <TasksLoadError error={error} onRetry={reload} />
  } else {
    content = (
      // DOM order = reading and focus order: overdue first. On desktop the grid
      // places it in the end column without changing that order (WCAG 1.3.2).
      <div className="grid gap-8 lg:grid-cols-3">
        <OverdueSection
          tasks={overdue}
          busyIds={busyIds}
          onToggle={(task, completed) => {
            actions.setCompleted(task, completed)
            focusDayHeading()
          }}
          onMoveToToday={(task) => {
            actions.moveToToday(task, today)
            focusDayHeading()
          }}
          className="lg:col-start-3 lg:row-start-1 lg:self-start"
        />
        <DayTasksSection
          date={date}
          today={today}
          tasks={dayTasks}
          busyIds={busyIds}
          headingRef={dayHeadingRef}
          onDateChange={(next) => setSelectedDate(next === today ? null : next)}
          onCreate={actions.create}
          onToggle={actions.setCompleted}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onRowHidden={focusDayHeading}
          className="flex flex-col gap-5 lg:col-span-2 lg:col-start-1 lg:row-start-1"
        />
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
          const saved = await actions.saveEdit(task, changes)
          // The row leaves the day when it moves to another date or no longer exists.
          if (changes.taskDate || !saved) focusDayHeading()
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
