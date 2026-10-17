import { useContext } from 'react'
import { TasksContext } from './TasksContext.js'

/**
 * The task state: { tasks, busyIds, loadStatus, error, reload, getTask, isBusy } plus
 * the raw actions { createTask, updateTask, setTaskCompletion, deleteTask }.
 * `loadStatus` is 'loading' | 'ready' | 'error' (the list, not a task's status).
 * `busyIds` is a Set of task ids with a request in flight (for rendering); `isBusy(id)`
 * answers the same question at once, for event handlers. `getTask(id)` returns the
 * current version of a task.
 *
 * The raw actions reject with a ServiceError and show nothing to the user.
 * UI components call the actions from `useTaskActions()` instead, which add feedback.
 */
export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used inside <TasksProvider>')
  return context
}
