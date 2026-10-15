let sequence = 0

/**
 * Builds a Task (API_CONTRACTS §1) for tests. Pass only the fields the test cares about.
 * A completed task gets a `completedAt` automatically, so it always respects BR-12.
 */
export function makeTask(overrides = {}) {
  sequence += 1
  const status = overrides.status ?? 'pending'
  const createdAt = overrides.createdAt ?? new Date(Date.UTC(2026, 0, 1, 0, 0, sequence)).toISOString()
  return {
    id: `task-${sequence}`,
    userId: 'local-user',
    title: `Task ${sequence}`,
    status,
    taskDate: '2026-10-14',
    createdAt,
    updatedAt: createdAt,
    completedAt: status === 'completed' ? createdAt : null,
    ...overrides,
  }
}
