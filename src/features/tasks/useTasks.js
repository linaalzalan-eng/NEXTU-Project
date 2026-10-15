import { useContext } from 'react'
import { TasksContext } from './TasksContext.js'

/**
 * Returns { tasks, busyIds, status, error, reload, createTask, updateTask, setTaskCompletion, deleteTask }.
 * `status` is 'loading' | 'ready' | 'error'. `busyIds` is a Set of task ids with a request in flight. Actions return promises that reject with a ServiceError.
 */
export function useTasks() {
  const context = useContext(TasksContext)
  if (!context) throw new Error('useTasks must be used inside <TasksProvider>')
  return context
}
