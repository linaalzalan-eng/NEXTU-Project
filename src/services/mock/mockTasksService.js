import { applyCompletion } from '@/features/tasks/lib/taskCompletion.js'
import { byDateThenCreation } from '@/features/tasks/lib/taskSelectors.js'
import { normalizeTitle, validateTaskInput } from '@/features/tasks/lib/taskValidation.js'
import { todayLocal } from '@/lib/dates.js'
import { ServiceError } from '../errors.js'
import { DEMO_USER } from './mockAuthService.js'

export const TASKS_STORAGE_KEY = 'nextu.tasks'

/**
 * Tasks service backed by localStorage (D-08, API_CONTRACTS §4). It follows the
 * same contract as the Supabase service in Phase 5, so the UI cannot tell them apart.
 * The options exist for tests: a fake storage, a fixed clock, predictable ids.
 * localStorage is looked up only when used: accessing it can throw when the browser
 * blocks site data, and that must become a ServiceError, not a failed import.
 */
export function createMockTasksService({
  storage,
  now = () => new Date(),
  createId = () => crypto.randomUUID(),
} = {}) {
  const getStorage = () => storage ?? globalThis.localStorage

  function read() {
    let raw
    try {
      raw = getStorage().getItem(TASKS_STORAGE_KEY)
    } catch (error) {
      throw new ServiceError('UNKNOWN', 'Could not read tasks from storage', error)
    }
    if (!raw) return []
    try {
      const tasks = JSON.parse(raw)
      return Array.isArray(tasks) ? tasks : []
    } catch {
      // Damaged data in a development mock: start again rather than lock the app.
      if (import.meta.env.DEV) console.warn('[mockTasksService] Ignoring unreadable stored tasks')
      return []
    }
  }

  function write(tasks) {
    try {
      getStorage().setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      throw new ServiceError('UNKNOWN', 'Could not save tasks to storage', error)
    }
  }

  function assertValid(input, options) {
    const errors = validateTaskInput(input, todayLocal(now()), options)
    const fields = Object.keys(errors)
    if (fields.length > 0) {
      throw new ServiceError('VALIDATION', fields.map((field) => `${field}: ${errors[field]}`).join(', '))
    }
  }

  function findIndex(tasks, id) {
    const index = tasks.findIndex((task) => task.id === id)
    if (index === -1) throw new ServiceError('NOT_FOUND', `Task ${id} not found`)
    return index
  }

  return {
    async listTasks({ from, to, status } = {}) {
      return read()
        .filter((task) => (!from || task.taskDate >= from) && (!to || task.taskDate <= to))
        .filter((task) => !status || task.status === status)
        .sort(byDateThenCreation)
    },

    async createTask({ title, taskDate }) {
      assertValid({ title, taskDate })
      const timestamp = now().toISOString()
      const task = {
        id: createId(),
        userId: DEMO_USER.id,
        title: normalizeTitle(title),
        status: 'pending',
        taskDate,
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      }
      write([...read(), task])
      return task
    },

    /** Changes the title and/or date only (BR-08: completedAt is kept). */
    async updateTask(id, changes = {}) {
      const allowed = {}
      if ('title' in changes) allowed.title = changes.title
      if ('taskDate' in changes) allowed.taskDate = changes.taskDate
      assertValid(allowed, { partial: true })
      if ('title' in allowed) allowed.title = normalizeTitle(allowed.title)

      const tasks = read()
      const index = findIndex(tasks, id)
      const updated = { ...tasks[index], ...allowed, updatedAt: now().toISOString() }
      tasks[index] = updated
      write(tasks)
      return updated
    },

    /** BR-12: completed sets completedAt to now; pending clears it. */
    async setTaskCompletion(id, completed) {
      const tasks = read()
      const index = findIndex(tasks, id)
      const timestamp = now().toISOString()
      const updated = { ...applyCompletion(tasks[index], completed, timestamp), updatedAt: timestamp }
      tasks[index] = updated
      write(tasks)
      return updated
    },

    /** Permanent delete (BR-07, D-12). */
    async deleteTask(id) {
      const tasks = read()
      tasks.splice(findIndex(tasks, id), 1)
      write(tasks)
    },
  }
}

export const mockTasksService = createMockTasksService()
