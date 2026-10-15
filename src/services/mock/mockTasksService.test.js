import { beforeEach, describe, expect, it } from 'vitest'
import { ServiceError } from '../errors.js'
import { mockAuthService } from './mockAuthService.js'
import { createMockTasksService, mockTasksService, TASKS_STORAGE_KEY } from './mockTasksService.js'

const NOW = new Date('2026-10-14T09:00:00.000Z')

function setup({ storage = localStorage } = {}) {
  let clock = NOW
  let nextId = 0
  const service = createMockTasksService({
    storage,
    now: () => clock,
    createId: () => `id-${++nextId}`,
  })
  return {
    service,
    tick(ms) {
      clock = new Date(clock.getTime() + ms)
    },
  }
}

async function expectServiceError(promise, code) {
  const error = await promise.catch((caught) => caught)
  expect(error).toBeInstanceOf(ServiceError)
  expect(error.code).toBe(code)
}

// UT-08 (API_CONTRACTS §4, BR-07, BR-08, BR-12, D-08)
describe('mockTasksService', () => {
  let service
  let tick

  beforeEach(() => {
    ;({ service, tick } = setup())
  })

  describe('createTask', () => {
    it('creates a pending task for the demo user with trimmed title', async () => {
      const task = await service.createTask({ title: '  Read 10 pages ', taskDate: '2026-10-14' })

      expect(task).toEqual({
        id: 'id-1',
        userId: 'local-user',
        title: 'Read 10 pages',
        status: 'pending',
        taskDate: '2026-10-14',
        createdAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
        completedAt: null,
      })
    })

    it('rejects invalid input with VALIDATION and saves nothing', async () => {
      await expectServiceError(service.createTask({ title: '   ', taskDate: '2026-10-14' }), 'VALIDATION')
      await expectServiceError(service.createTask({ title: 'Read', taskDate: '2026-02-30' }), 'VALIDATION')
      await expectServiceError(service.createTask({ title: 'Read', taskDate: '2027-10-15' }), 'VALIDATION')
      expect(await service.listTasks()).toEqual([])
    })
  })

  describe('listTasks', () => {
    beforeEach(async () => {
      await service.createTask({ title: 'B', taskDate: '2026-10-15' })
      tick(1000)
      await service.createTask({ title: 'A', taskDate: '2026-10-14' })
      tick(1000)
      const done = await service.createTask({ title: 'C', taskDate: '2026-10-14' })
      await service.setTaskCompletion(done.id, true)
      await service.createTask({ title: 'Old', taskDate: '2026-10-01' })
    })

    it('returns the full history sorted by date, then creation time', async () => {
      expect((await service.listTasks()).map((task) => task.title)).toEqual(['Old', 'A', 'C', 'B'])
    })

    it('filters by an inclusive date range', async () => {
      const tasks = await service.listTasks({ from: '2026-10-14', to: '2026-10-14' })
      expect(tasks.map((task) => task.title)).toEqual(['A', 'C'])
    })

    it('filters by status', async () => {
      const tasks = await service.listTasks({ status: 'completed' })
      expect(tasks.map((task) => task.title)).toEqual(['C'])
    })
  })

  describe('updateTask', () => {
    it('changes the title and date and updates updatedAt (BR-08)', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })
      tick(60_000)

      const updated = await service.updateTask(task.id, { title: ' Read more ', taskDate: '2026-10-20' })

      expect(updated).toMatchObject({ title: 'Read more', taskDate: '2026-10-20', createdAt: task.createdAt })
      expect(updated.updatedAt).toBe(new Date(NOW.getTime() + 60_000).toISOString())
    })

    it('keeps completedAt when a completed task is rescheduled (BR-08)', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })
      const completed = await service.setTaskCompletion(task.id, true)

      const moved = await service.updateTask(task.id, { taskDate: '2026-10-15' })

      expect(moved).toMatchObject({ status: 'completed', completedAt: completed.completedAt })
    })

    it('ignores fields other than title and date', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })

      const updated = await service.updateTask(task.id, { status: 'completed', userId: 'someone-else' })

      expect(updated).toMatchObject({ status: 'pending', userId: 'local-user' })
    })

    it('rejects invalid changes with VALIDATION', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })
      await expectServiceError(service.updateTask(task.id, { title: '' }), 'VALIDATION')
    })

    it('throws NOT_FOUND for an unknown id', async () => {
      await expectServiceError(service.updateTask('missing', { title: 'X' }), 'NOT_FOUND')
    })
  })

  describe('setTaskCompletion (BR-12)', () => {
    it('sets status and completedAt together, and clears both when undone', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })
      tick(5000)

      const completed = await service.setTaskCompletion(task.id, true)
      expect(completed).toMatchObject({ status: 'completed', completedAt: new Date(NOW.getTime() + 5000).toISOString() })

      const undone = await service.setTaskCompletion(task.id, false)
      expect(undone).toMatchObject({ status: 'pending', completedAt: null })
    })

    it('throws NOT_FOUND for an unknown id', async () => {
      await expectServiceError(service.setTaskCompletion('missing', true), 'NOT_FOUND')
    })
  })

  describe('deleteTask (BR-07)', () => {
    it('removes the task permanently', async () => {
      const keep = await service.createTask({ title: 'Keep', taskDate: '2026-10-14' })
      const remove = await service.createTask({ title: 'Remove', taskDate: '2026-10-14' })

      await service.deleteTask(remove.id)

      expect(await service.listTasks()).toEqual([keep])
    })

    it('throws NOT_FOUND for an unknown id', async () => {
      await expectServiceError(service.deleteTask('missing'), 'NOT_FOUND')
    })
  })

  describe('persistence (US-25)', () => {
    it('survives a new service instance (a page reload)', async () => {
      const task = await service.createTask({ title: 'Read', taskDate: '2026-10-14' })

      const { service: afterReload } = setup()

      expect(await afterReload.listTasks()).toEqual([task])
      expect(JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY))).toEqual([task])
    })

    it('starts empty when stored data is unreadable', async () => {
      localStorage.setItem(TASKS_STORAGE_KEY, '{not json')
      expect(await service.listTasks()).toEqual([])
    })

    it('reports a storage write failure as UNKNOWN', async () => {
      const fullStorage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceededError')
        },
      }
      const { service: failing } = setup({ storage: fullStorage })

      await expectServiceError(failing.createTask({ title: 'Read', taskDate: '2026-10-14' }), 'UNKNOWN')
    })
  })

  it('the default instance implements the whole contract', () => {
    for (const name of ['listTasks', 'createTask', 'updateTask', 'setTaskCompletion', 'deleteTask']) {
      expect(mockTasksService[name]).toBeTypeOf('function')
    }
  })
})

describe('mockAuthService', () => {
  it('always has the fixed demo user signed in', async () => {
    const session = await mockAuthService.getSession()
    expect(session.user).toEqual({ id: 'local-user', email: 'demo@nextu.local' })
    expect(mockAuthService.onAuthStateChange(() => {})).toBeTypeOf('function')
  })
})
