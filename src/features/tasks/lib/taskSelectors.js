/** Pure helpers that pick and order tasks for the views. None of them change their input. */

export const STATUS_FILTERS = ['all', 'pending', 'completed']

/** Ids of optimistic tasks that the service has not saved yet (TasksProvider). */
export const TEMP_ID_PREFIX = 'temp-'

/** True while a new task is still being saved; it cannot be edited until it has a real id. */
export function isTempTask(task) {
  return task.id.startsWith(TEMP_ID_PREFIX)
}

/**
 * True when the UI must block actions on the task: it is still being saved, or a
 * request for it is in flight (`busyIds`, a Set from TasksProvider).
 */
export function isTaskLocked(task, busyIds) {
  return isTempTask(task) || Boolean(busyIds?.has(task.id))
}

const byCreation = (a, b) => a.createdAt.localeCompare(b.createdAt)

/** The service order (API_CONTRACTS §4): taskDate, then createdAt, then id, so ties are deterministic. */
export function byDateThenCreation(a, b) {
  return a.taskDate.localeCompare(b.taskDate) || byCreation(a, b) || a.id.localeCompare(b.id)
}

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
