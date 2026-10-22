import { describe, expect, it } from 'vitest'
import { createFakeSupabase, makeRow } from '@/test/fakeSupabase.js'
import { ServiceError } from '../errors.js'
import { createSupabaseTasksService, PAGE_SIZE, toTask } from './supabaseTasksService.js'

const NOW = new Date('2026-10-14T10:00:00.000Z')
const ID = '00000000-0000-4000-8000-000000000001'

function setup(options) {
  const fake = createFakeSupabase(options)
  const service = createSupabaseTasksService(fake.client, { now: () => NOW })
  return { ...fake, service }
}

async function expectServiceError(promise, code) {
  const error = await promise.catch((caught) => caught)
  expect(error).toBeInstanceOf(ServiceError)
  expect(error.code).toBe(code)
  return error
}

// P5-T06 (API_CONTRACTS §1 and §4, D-09, D-29 M-2)
describe('toTask', () => {
  it('maps snake_case columns to the camelCase Task shape', () => {
    expect(toTask(makeRow({ status: 'completed', completed_at: '2026-10-14T11:30:00+00:00' }))).toEqual({
      id: ID,
      userId: 'user-a',
      title: 'Read 10 pages',
      status: 'completed',
      taskDate: '2026-10-14',
      createdAt: '2026-10-14T09:00:00.123Z',
      updatedAt: '2026-10-14T09:00:00.123Z',
      completedAt: '2026-10-14T11:30:00.000Z',
    })
  })

  it('writes every timestamp in toISOString() form, so string comparison sorts correctly', () => {
    const task = toTask(makeRow({ created_at: '2026-10-14T12:00:00+03:00' }))
    expect(task.createdAt).toBe('2026-10-14T09:00:00.000Z')
    expect(task.completedAt).toBeNull()
  })
})

describe('createSupabaseTasksService', () => {
  describe('listTasks', () => {
    it('orders deterministically and maps the rows', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [makeRow()] })

      const tasks = await service.listTasks()

      expect(tasks).toEqual([toTask(makeRow())])
      expect(queries[0].table).toBe('tasks')
      expect(queries[0].calls).toEqual([
        ['select', 'id, user_id, title, status, task_date, created_at, updated_at, completed_at'],
        ['order', 'task_date', { ascending: true }],
        ['order', 'created_at', { ascending: true }],
        ['order', 'id', { ascending: true }],
        ['range', 0, PAGE_SIZE - 1],
      ])
    })

    it('reads page after page until an empty page (more than 1000 rows)', async () => {
      const { service, respond, queries } = setup()
      const page = (count, offset) =>
        Array.from({ length: count }, (_, index) => makeRow({ id: `id-${offset + index}` }))
      respond({ data: page(PAGE_SIZE, 0) })
      respond({ data: page(PAGE_SIZE, PAGE_SIZE) })
      respond({ data: page(3, 2 * PAGE_SIZE) })

      const tasks = await service.listTasks()

      expect(tasks).toHaveLength(2 * PAGE_SIZE + 3)
      expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length)
      expect(queries.map((query) => query.calls.at(-1))).toEqual([
        ['range', 0, 999],
        ['range', 1000, 1999],
        ['range', 2000, 2999],
        ['range', 2003, 3002],
      ])
    })

    it('continues after the rows received when the project returns fewer than 1000 per request', async () => {
      const { service, respond, queries } = setup()
      respond({ data: Array.from({ length: 500 }, (_, index) => makeRow({ id: `id-${index}` })) })
      respond({ data: Array.from({ length: 200 }, (_, index) => makeRow({ id: `id-${500 + index}` })) })
      expect(await service.listTasks()).toHaveLength(700)
      expect(queries.map((query) => query.calls.at(-1))).toEqual([
        ['range', 0, 999],
        ['range', 500, 1499],
        ['range', 700, 1699],
      ])
    })

    it('applies the optional filters', async () => {
      const { service, queries } = setup()
      await service.listTasks({ from: '2026-10-10', to: '2026-10-16', status: 'completed' })
      expect(queries[0].calls.slice(1, 4)).toEqual([
        ['gte', 'task_date', '2026-10-10'],
        ['lte', 'task_date', '2026-10-16'],
        ['eq', 'status', 'completed'],
      ])
    })

    it('throws UNAUTHENTICATED without a session, instead of returning an empty list', async () => {
      const { service, queries } = setup({ session: null })
      await expectServiceError(service.listTasks(), 'UNAUTHENTICATED')
      expect(queries).toHaveLength(0)
    })
  })

  describe('createTask', () => {
    it('inserts the trimmed title and date, and never sends user_id', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [makeRow()] })

      const task = await service.createTask({ title: '  Read 10 pages  ', taskDate: '2026-10-14' })

      expect(task.title).toBe('Read 10 pages')
      const [insert] = queries[0].calls
      expect(insert).toEqual(['insert', { title: 'Read 10 pages', task_date: '2026-10-14' }])
      expect(insert[1]).not.toHaveProperty('user_id')
    })

    it('validates before any request (VR-03, VR-04, BR-14 against the injected clock)', async () => {
      const { service, queries } = setup()
      await expectServiceError(service.createTask({ title: '   ', taskDate: '2026-10-14' }), 'VALIDATION')
      await expectServiceError(service.createTask({ title: 'Read', taskDate: '14/10/2026' }), 'VALIDATION')
      await expectServiceError(service.createTask({ title: 'Read', taskDate: '2027-10-15' }), 'VALIDATION')
      expect(queries).toHaveLength(0)
    })

    it('throws UNAUTHENTICATED without a session, before inserting', async () => {
      const { service, queries } = setup({ session: null })
      await expectServiceError(service.createTask({ title: 'Read', taskDate: '2026-10-14' }), 'UNAUTHENTICATED')
      expect(queries).toHaveLength(0)
    })
  })

  describe('updateTask', () => {
    it('sends only the title and date (BR-08)', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [makeRow({ title: 'Read 20 pages', task_date: '2026-10-15' })] })

      const task = await service.updateTask(ID, {
        title: ' Read 20 pages ',
        taskDate: '2026-10-15',
        status: 'completed',
        userId: 'user-b',
      })

      expect(task).toMatchObject({ title: 'Read 20 pages', taskDate: '2026-10-15' })
      expect(queries[0].calls.slice(0, 2)).toEqual([
        ['update', { title: 'Read 20 pages', task_date: '2026-10-15' }],
        ['eq', 'id', ID],
      ])
    })

    it('validates before any request, and needs a session', async () => {
      const { service, queries } = setup()
      await expectServiceError(service.updateTask(ID, { title: '' }), 'VALIDATION')
      expect(queries).toHaveLength(0)
      const signedOut = setup({ session: null })
      await expectServiceError(signedOut.service.updateTask(ID, { title: 'New' }), 'UNAUTHENTICATED')
      await expectServiceError(signedOut.service.setTaskCompletion(ID, true), 'UNAUTHENTICATED')
      await expectServiceError(signedOut.service.deleteTask(ID), 'UNAUTHENTICATED')
      expect(signedOut.queries).toHaveLength(0)
    })

    it('with nothing to change, returns the task as it is', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [makeRow()] })
      expect(await service.updateTask(ID, {})).toEqual(toTask(makeRow()))
      expect(queries[0].calls[0][0]).toBe('select')
    })

    it('reports NOT_FOUND when no row matched: unknown, or another user’s task under RLS', async () => {
      const { service, respond } = setup()
      respond({ data: [] })
      await expectServiceError(service.updateTask(ID, { title: 'New' }), 'NOT_FOUND')
    })
  })

  describe('setTaskCompletion (BR-12)', () => {
    it('sets status and completed_at together', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [makeRow({ status: 'completed', completed_at: NOW.toISOString() })] })
      respond({ data: [makeRow()] })

      const done = await service.setTaskCompletion(ID, true)
      const undone = await service.setTaskCompletion(ID, false)

      expect(queries[0].calls[0]).toEqual(['update', { status: 'completed', completed_at: '2026-10-14T10:00:00.000Z' }])
      expect(queries[1].calls[0]).toEqual(['update', { status: 'pending', completed_at: null }])
      expect(done).toMatchObject({ status: 'completed', completedAt: '2026-10-14T10:00:00.000Z' })
      expect(undone).toMatchObject({ status: 'pending', completedAt: null })
    })

    it('reports NOT_FOUND when no row matched', async () => {
      const { service, respond } = setup()
      respond({ data: [] })
      await expectServiceError(service.setTaskCompletion(ID, true), 'NOT_FOUND')
    })
  })

  describe('deleteTask (BR-07)', () => {
    it('deletes by id and checks that a row was removed', async () => {
      const { service, respond, queries } = setup()
      respond({ data: [{ id: ID }] })
      await expect(service.deleteTask(ID)).resolves.toBeUndefined()
      expect(queries[0].calls).toEqual([['delete'], ['eq', 'id', ID], ['select', 'id']])

      respond({ data: [] })
      await expectServiceError(service.deleteTask(ID), 'NOT_FOUND')
    })
  })

  describe('error mapping (API_CONTRACTS §2, NFR-14)', () => {
    it.each([
      [{ status: 0, error: { message: 'TypeError: Failed to fetch', code: '' } }, 'NETWORK'],
      [{ status: 400, error: { code: '23514', message: 'violates check constraint "tasks_title_length"' } }, 'VALIDATION'],
      [{ status: 401, error: { code: 'PGRST301', message: 'JWT expired' } }, 'UNAUTHENTICATED'],
      [{ status: 403, error: { code: '42501', message: 'new row violates row-level security policy' } }, 'UNAUTHENTICATED'],
      [{ status: 500, error: { code: 'XX000', message: 'internal' } }, 'UNKNOWN'],
    ])('maps %j to %s and keeps the raw error as the cause', async (response, code) => {
      const { service, respond } = setup()
      respond({ data: null, ...response })
      const error = await expectServiceError(service.listTasks(), code)
      expect(error.cause).toBe(response.error)
    })
  })
})
