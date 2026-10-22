import { normalizeTitle, validateTaskInput } from '@/features/tasks/lib/taskValidation.js'
import { todayLocal } from '@/lib/dates.js'
import { ServiceError } from '../errors.js'
import { toDatabaseServiceError } from './supabaseErrors.js'

const TABLE = 'tasks'
const COLUMNS = 'id, user_id, title, status, task_date, created_at, updated_at, completed_at'
// Supabase returns at most 1000 rows per request by default (D-09). A project can set a
// lower limit, so the next page starts after the rows actually received, and reading
// stops at an empty page, never at a short one (D-30).
export const PAGE_SIZE = 1000

/**
 * Supabase sends timestamps like "2026-10-14T09:00:00.123456+00:00". The sort
 * comparators compare createdAt as strings, so every timestamp is rewritten in
 * the one toISOString() form the mock also uses (D-29, CODE_SMELL M-2).
 */
const toIso = (value) => (value == null ? null : new Date(value).toISOString())

/** A database row (snake_case) → a Task (camelCase, API_CONTRACTS §1). No other file sees snake_case. */
export function toTask(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    status: row.status,
    taskDate: row.task_date,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    completedAt: toIso(row.completed_at),
  }
}

function assertValid(input, today, options) {
  const errors = validateTaskInput(input, today, options)
  const fields = Object.keys(errors)
  if (fields.length > 0) {
    throw new ServiceError('VALIDATION', fields.map((field) => `${field}: ${errors[field]}`).join(', '))
  }
}

/** Awaits a query and returns its rows, or throws a ServiceError. */
async function run(query) {
  let response
  try {
    response = await query
  } catch (caught) {
    throw new ServiceError('NETWORK', caught?.message, caught)
  }
  if (response.error) throw toDatabaseServiceError(response)
  return response.data
}

/**
 * Tasks service backed by the Supabase `tasks` table (API_CONTRACTS §4).
 * It never sends `user_id`: the column defaults to auth.uid(), and RLS limits every
 * query to the signed-in user's rows (DATABASE_SCHEMA §3). A task that belongs to
 * someone else therefore looks exactly like a task that does not exist: NOT_FOUND.
 */
export function createSupabaseTasksService(client, { now = () => new Date() } = {}) {
  /** Without a session RLS would quietly return nothing; the contract asks for UNAUTHENTICATED instead. */
  async function requireSession() {
    const { data, error } = await client.auth.getSession()
    if (error || !data.session) throw new ServiceError('UNAUTHENTICATED', error?.message ?? 'No session', error)
  }

  /** For update and delete: zero returned rows means the id is unknown or not ours. */
  function single(rows, id) {
    if (!rows || rows.length === 0) throw new ServiceError('NOT_FOUND', `Task ${id} not found`)
    return rows[0]
  }

  const today = () => todayLocal(now())

  return {
    /** Reads page after page in a fully deterministic order, so no row is skipped or repeated (API_CONTRACTS §4). */
    async listTasks({ from, to, status } = {}) {
      await requireSession()
      const tasks = []
      for (let start = 0; ; ) {
        let query = client.from(TABLE).select(COLUMNS)
        if (from) query = query.gte('task_date', from)
        if (to) query = query.lte('task_date', to)
        if (status) query = query.eq('status', status)
        const rows = await run(
          query
            .order('task_date', { ascending: true })
            .order('created_at', { ascending: true })
            .order('id', { ascending: true })
            .range(start, start + PAGE_SIZE - 1),
        )
        if (rows.length === 0) return tasks
        tasks.push(...rows.map(toTask))
        start += rows.length
      }
    },

    async createTask({ title, taskDate }) {
      assertValid({ title, taskDate }, today())
      await requireSession()
      const rows = await run(
        client.from(TABLE).insert({ title: normalizeTitle(title), task_date: taskDate }).select(COLUMNS),
      )
      return toTask(single(rows, 'new'))
    },

    /** Title and/or date only (BR-08). updated_at is set by the database trigger. */
    async updateTask(id, changes = {}) {
      const allowed = {}
      if ('title' in changes) allowed.title = changes.title
      if ('taskDate' in changes) allowed.taskDate = changes.taskDate
      assertValid(allowed, today(), { partial: true })
      await requireSession()

      const row = {}
      if ('title' in allowed) row.title = normalizeTitle(allowed.title)
      if ('taskDate' in allowed) row.task_date = allowed.taskDate
      // Nothing to change: return the task as it is, like the mock (an empty update returns no rows).
      const query =
        Object.keys(row).length === 0
          ? client.from(TABLE).select(COLUMNS).eq('id', id)
          : client.from(TABLE).update(row).eq('id', id).select(COLUMNS)
      return toTask(single(await run(query), id))
    },

    /** BR-12. The database constraint rejects any mismatch between status and completed_at. */
    async setTaskCompletion(id, completed) {
      await requireSession()
      const row = completed
        ? { status: 'completed', completed_at: now().toISOString() }
        : { status: 'pending', completed_at: null }
      const rows = await run(client.from(TABLE).update(row).eq('id', id).select(COLUMNS))
      return toTask(single(rows, id))
    },

    /** Permanent delete (BR-07). Asking for the deleted id back tells us whether a row was removed. */
    async deleteTask(id) {
      await requireSession()
      const rows = await run(client.from(TABLE).delete().eq('id', id).select('id'))
      single(rows, id)
    },
  }
}
