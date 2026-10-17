import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ui/ToastProvider.jsx'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { ServiceError, tasksService } from '@/services'
import { setupUser } from '@/test/setupUser.js'
import { TasksProvider } from './TasksProvider.jsx'
import { useTaskActions } from './useTaskActions.js'
import { useTasks } from './useTasks.js'

const TODAY = '2026-10-14'
const NETWORK_MESSAGE = 'We couldn’t reach the server. Check your connection and try again.'
const GONE_MESSAGE = 'This task no longer exists. The list has been updated.'

function Providers({ children }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <TasksProvider>{children}</TasksProvider>
      </ToastProvider>
    </I18nProvider>
  )
}

/** The actions plus the task state, so a test can check both. */
async function renderActions() {
  localStorage.setItem('mind.lang', 'en')
  const view = renderHook(() => ({ actions: useTaskActions(), state: useTasks() }), { wrapper: Providers })
  await waitFor(() => expect(view.result.current.state.loadStatus).toBe('ready'))
  return { ...view, user: setupUser() }
}

/** A promise the test settles by hand. */
function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// The useTaskActions contract (D-29): resolve to the task or null, never reject, except saveEdit.
describe('useTaskActions', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('create resolves to null and offers a retry when saving fails', async () => {
    const { result, user } = await renderActions()
    vi.spyOn(tasksService, 'createTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

    let outcome
    await act(async () => {
      outcome = await result.current.actions.create({ title: 'Read', taskDate: TODAY })
    })

    expect(outcome).toBeNull()
    expect(screen.getByText(NETWORK_MESSAGE)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(result.current.state.tasks).toMatchObject([{ title: 'Read', status: 'pending' }]))
  })

  it('remove resolves to null when it fails, and "Try again" deletes the task', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result, user } = await renderActions()
    vi.spyOn(tasksService, 'deleteTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

    let outcome
    await act(async () => {
      outcome = await result.current.actions.remove(task)
    })
    expect(outcome).toBeNull()
    expect(result.current.state.tasks).toEqual([task])

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Task deleted.')).toBeInTheDocument()
    expect(result.current.state.tasks).toEqual([])
  })

  it('moveToToday resolves to null with a notice when the task is gone', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: '2026-10-12' })
    const { result } = await renderActions()
    await tasksService.deleteTask(task.id) // deleted in "another tab"

    let outcome
    await act(async () => {
      outcome = await result.current.actions.moveToToday(task, TODAY)
    })

    expect(outcome).toBeNull()
    expect(screen.getByText(GONE_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('"Try again" says the task is gone instead of retrying a deleted task', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result, user } = await renderActions()
    vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))
    await act(() => result.current.actions.setCompleted(task, true))
    await act(() => result.current.actions.remove(task))

    const save = vi.spyOn(tasksService, 'setTaskCompletion')
    save.mockClear()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByText(GONE_MESSAGE)).toBeInTheDocument()
    expect(save).not.toHaveBeenCalled()
  })

  it('"Try again" starts from the current version, so its rollback matches the stored task', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result, user } = await renderActions()
    const save = vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))
    await act(() => result.current.actions.setCompleted(task, true)) // fails: pending
    await act(() => result.current.actions.setCompleted(task, true)) // succeeds: completed

    save.mockRejectedValueOnce(new ServiceError('NETWORK'))
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    // The retry's rollback restores "completed" (the current version), not the old "pending" copy.
    await waitFor(() => expect(save).toHaveBeenCalledTimes(3))
    await waitFor(() => expect(result.current.state.busyIds.size).toBe(0))
    expect(result.current.state.tasks[0].status).toBe('completed')
    expect((await tasksService.listTasks())[0].status).toBe('completed')
  })

  it('"Try again" does nothing while another request for the task is in flight', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
    const { result, user } = await renderActions()
    const save = vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))
    await act(() => result.current.actions.setCompleted(task, true))

    const held = deferred()
    save.mockReturnValueOnce(held.promise)
    act(() => {
      result.current.actions.setCompleted(task, true)
    })
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(save).toHaveBeenCalledTimes(2) // the failed one and the one in flight, no third
    await act(async () => {
      held.resolve({ ...task, status: 'completed', completedAt: new Date().toISOString(), updatedAt: task.updatedAt })
      await held.promise
    })
    expect(result.current.state.busyIds.size).toBe(0)
  })

  describe('saveEdit', () => {
    it('rejects with the ServiceError so the dialog can show it', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderActions()
      vi.spyOn(tasksService, 'updateTask').mockRejectedValueOnce(new ServiceError('NETWORK'))

      await act(async () => {
        await expect(result.current.actions.saveEdit(task, { title: 'Read more' })).rejects.toMatchObject({
          code: 'NETWORK',
        })
      })
      expect(screen.queryByText(NETWORK_MESSAGE)).not.toBeInTheDocument()
    })

    it('resolves to null with the notice when the task is gone', async () => {
      const task = await tasksService.createTask({ title: 'Read', taskDate: TODAY })
      const { result } = await renderActions()
      await tasksService.deleteTask(task.id)

      let outcome
      await act(async () => {
        outcome = await result.current.actions.saveEdit(task, { title: 'Read more' })
      })

      expect(outcome).toBeNull()
      expect(screen.getByText(GONE_MESSAGE)).toBeInTheDocument()
    })
  })
})
