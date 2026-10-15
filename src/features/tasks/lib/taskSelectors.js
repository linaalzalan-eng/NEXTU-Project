/** Pure helpers that pick and order tasks for the views. None of them change their input. */

export const STATUS_FILTERS = ['all', 'pending', 'completed']

/** Ids of optimistic tasks that the service has not saved yet (TasksProvider). */
export const TEMP_ID_PREFIX = 'temp-'

/** True while a new task is still being saved; it cannot be edited until it has a real id. */
export function isTempTask(task) {
  return task.id.startsWith(TEMP_ID_PREFIX)
}

const byCreation = (a, b) => a.createdAt.localeCompare(b.createdAt)
const byDateThenCreation = (a, b) => a.taskDate.localeCompare(b.taskDate) || byCreation(a, b)

export function selectTasksForDate(tasks, date) {
  return tasks.filter((task) => task.taskDate === date)
}

/** 'all' | 'pending' | 'completed' (FR-13). */
export function filterByStatus(tasks, status) {
  return status === 'all' ? tasks : tasks.filter((task) => task.status === status)
}

/** BR-09: pending and dated before today (today itself is never overdue), oldest first. */
export function selectOverdue(tasks, today) {
  return tasks.filter((task) => task.status === 'pending' && task.taskDate < today).sort(byDateThenCreation)
}

/** PRD F2: pending before completed, each group by creation time. */
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1
    return byCreation(a, b)
  })
}
