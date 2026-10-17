/**
 * BR-12 in one place: completing sets completedAt to the given time; marking
 * pending clears it. Used by the optimistic update (TasksProvider) and the mock
 * service, so both always agree. Returns a new object.
 */
export function applyCompletion(task, completed, timestamp) {
  return {
    ...task,
    status: completed ? 'completed' : 'pending',
    completedAt: completed ? timestamp : null,
  }
}
