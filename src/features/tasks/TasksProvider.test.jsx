import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ServiceError, tasksService } from '@/services'
import { TasksProvider } from './TasksProvider.jsx'
import { useTasks } from './useTasks.js'

const TODAY = '2026-10-14'

async function renderTasks() {
  const view = renderHook(() => useTasks(), { wrapper: TasksProvider })
  await waitFor(() => expect(view.result.current.loadStatus).toBe('ready'))
  return view
}

/** A promise the test resolves or rejects by hand, to look at the optimistic state in between. */
function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// P3-T05: state, optimistic updates, and rollback (NFR-02, NFR-21)
describe('TasksProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('loads the saved tasks', async () => {
    const saved = await tasksService.createTask({ title: 'Saved', taskDate: TODAY })

    const { result } = await renderTasks()

    expect(result.current.tasks).toEqual([saved])
    expect(result.current.error).toBeNull()
  })

  it('reports a load failure and can reload', async () => {
    vi.spyOn(tasksService, 'listTasks').mockRejectedValueOnce(new ServiceError('NETWORK'))
    const { result } = renderHook(() => useTasks(), { wrapper: TasksProvider })

    await waitFor(() => expect(result.current.loadStatus).toBe('error'))
    expect(result.current.error.code).toBe('NETWORK')

    act(() => result.current.reload())
    expect(result.current.loadStatus).toBe('loading')
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'))
  })

  describe('createTask', () => {
    it('shows the task at once, then swaps in the saved one', async () => {
      const { result } = await renderTasks()
      const save = deferred()
      vi.spyOn(tasksService, 'createTask').mockReturnValueOnce(save.promise)

      let pending
      act(() => {
        pending = result.current.createTask({ title: ' Read ', taskDate: TODAY })
      })
      expect(result.current.tasks).toEqual([
        expect.objectContaining({ id: expect.stringMatching(/^temp-/), title: 'Read', status: 'pending' }),
      ])

      const saved = { ...result.current.tasks[0], id: 'real-id' }
      await act(async () => {
        save.resolve(saved)
        await pending
      })
      expect(result.current.tasks).toEqual([saved])
    })

    it('removes the optimistic task and re-throws when saving fails', async () => {
      const { result } = await renderTasks()
      vi.spyOn(tasksService, 'createTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.createTask({ title: 'Read', taskDate: TODAY })).rejects.toMatchObject({
          code: 'NETWORK',
        })
      })

      expect(result.current.tasks).toEqual([])
    })
  })

  describe('setTaskCompletion', () => {
    it('saves the new state (BR-12)', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()

      await act(() => result.current.setTaskCompletion(task, true))

      expect(result.current.tasks[0]).toMatchObject({ status: 'completed', completedAt: expect.any(String) })
      expect((await tasksService.listTasks())[0].status).toBe('completed')
    })

    it('restores the task when the service fails', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.setTaskCompletion(task, true)).rejects.toMatchObject({ code: 'NETWORK' })
      })

      expect(result.current.tasks).toEqual([task])
    })

    it('undoes only the completion, keeping a newer title (a retry from an older copy)', async () => {
      const original = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      await act(() => result.current.updateTask(original, { title: 'Read more' }))
      vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.setTaskCompletion(original, true)).rejects.toMatchObject({ code: 'NETWORK' })
      })

      expect(result.current.tasks[0]).toMatchObject({ title: 'Read more', status: 'pending', completedAt: null })
    })

    it('removes a task that no longer exists (NOT_FOUND)', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      await tasksService.deleteTask(task.id) // deleted in "another tab"

      await act(async () => {
        await expect(result.current.setTaskCompletion(task, true)).rejects.toMatchObject({ code: 'NOT_FOUND' })
      })

      expect(result.current.tasks).toEqual([])
    })
  })

  describe('deleteTask', () => {
    it('removes the task permanently', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()

      await act(() => result.current.deleteTask(task))

      expect(result.current.tasks).toEqual([])
      expect(await tasksService.listTasks()).toEqual([])
    })

    it('puts the task back when the service fails', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      vi.spyOn(tasksService, 'deleteTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.deleteTask(task)).rejects.toMatchObject({ code: 'NETWORK' })
      })

      expect(result.current.tasks).toEqual([task])
    })

    it('puts back the version that was on screen, not an older copy', async () => {
      const original = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      let edited
      await act(async () => {
        edited = await result.current.updateTask(original, { title: 'Read more' })
      })
      vi.spyOn(tasksService, 'deleteTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.deleteTask(original)).rejects.toMatchObject({ code: 'NETWORK' })
      })

      expect(result.current.tasks).toEqual([edited])
    })

    it('treats NOT_FOUND as already deleted', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      await tasksService.deleteTask(task.id)

      await act(() => result.current.deleteTask(task))

      expect(result.current.tasks).toEqual([])
    })
  })

  describe('updateTask', () => {
    it('waits for the service, then shows the saved task (BR-08)', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()

      await act(() => result.current.updateTask(task, { title: 'Read more', taskDate: '2026-10-15' }))

      expect(result.current.tasks[0]).toMatchObject({ title: 'Read more', taskDate: '2026-10-15' })
    })

    it('keeps the old values when the service fails', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderTasks()
      vi.spyOn(tasksService, 'updateTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.updateTask(task, { title: 'X' })).rejects.toMatchObject({ code: 'NETWORK' })
      })

      expect(result.current.tasks).toEqual([task])
    })
  })

  it('marks a task busy while its request is in flight', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result } = await renderTasks()
    const save = deferred()
    vi.spyOn(tasksService, 'setTaskCompletion').mockReturnValueOnce(save.promise)

    let pending
    act(() => {
      pending = result.current.setTaskCompletion(task, true)
    })
    expect(result.current.busyIds.has(task.id)).toBe(true)

    await act(async () => {
      save.resolve({ ...task, status: 'completed', completedAt: new Date().toISOString() })
      await pending
    })
    expect(result.current.busyIds.has(task.id)).toBe(false)
  })

  it('updateTask removes a task that no longer exists (NOT_FOUND)', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result } = await renderTasks()
    await tasksService.deleteTask(task.id)

    await act(async () => {
      await expect(result.current.updateTask(task, { title: 'X' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    expect(result.current.tasks).toEqual([])
    expect(result.current.busyIds.size).toBe(0)
  })

  it('getTask returns the current version of a task, or undefined when it is gone', async () => {
    const original = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result } = await renderTasks()

    await act(() => result.current.updateTask(original, { title: 'Read more' }))

    expect(result.current.getTask(original.id)).toMatchObject({ title: 'Read more' })
    expect(result.current.getTask('missing')).toBeUndefined()
  })

  it('throws a clear error when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useTasks())).toThrow('useTasks must be used inside <TasksProvider>')
  })
})
