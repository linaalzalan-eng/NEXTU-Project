import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App.jsx'
import { ServiceError, tasksService } from '@/services'
import { setupUser } from '@/test/setupUser.js'

/** Renders the whole app on /tasks in English, as a user would open it. */
async function openTasksPage() {
  localStorage.setItem('mind.lang', 'en')
  window.history.pushState({}, '', '/tasks')
  const user = setupUser()
  const view = render(<App />)
  await screen.findByLabelText('New task')
  return { user, ...view }
}

const dayList = () => screen.getByRole('region', { name: /Wednesday, October 14|Thursday, October 15/ })

describe('Tasks page (integration)', () => {
  beforeEach(() => {
    // Only Date is faked, so "today" is fixed (Wednesday 2026-10-14) while timers stay real.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // IT-01 (US-07 to US-13, US-25)
  it('creates, completes, edits, reschedules, finds, and deletes a task', async () => {
    const { user, unmount } = await openTasksPage()
    expect(screen.getByRole('heading', { name: 'Wednesday, October 14' })).toBeInTheDocument()
    expect(screen.getByText('Nothing planned for this day')).toBeInTheDocument()

    // Create
    await user.type(screen.getByLabelText('New task'), 'Read 10 pages{Enter}')
    const checkbox = await screen.findByRole('checkbox', { name: 'Read 10 pages' })

    // Complete
    await user.click(checkbox)
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Read 10 pages' })).toBeChecked())

    // Survives a reload (US-25)
    unmount()
    await openTasksPage()
    expect(await screen.findByRole('checkbox', { name: 'Read 10 pages' })).toBeChecked()

    // Edit the title
    await user.click(screen.getByRole('button', { name: 'Edit “Read 10 pages”' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit task' })
    await user.clear(within(dialog).getByLabelText('Title'))
    await user.type(within(dialog).getByLabelText('Title'), 'Read 20 pages{Enter}')
    expect(await screen.findByRole('checkbox', { name: 'Read 20 pages' })).toBeInTheDocument()

    // Reschedule to tomorrow: it leaves today (BR-08)
    await user.click(screen.getByRole('button', { name: 'Edit “Read 20 pages”' }))
    await user.clear(within(dialog).getByLabelText('Date'))
    await user.type(within(dialog).getByLabelText('Date'), '2026-10-15')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Task moved to October 15.')).toBeInTheDocument()
    expect(within(dayList()).queryByText('Read 20 pages')).not.toBeInTheDocument()

    // Navigate to tomorrow: it is there
    await user.click(screen.getByRole('button', { name: 'Next day' }))
    expect(screen.getByRole('heading', { name: 'Thursday, October 15' })).toBeInTheDocument()
    expect(within(dayList()).getByRole('checkbox', { name: 'Read 20 pages' })).toBeChecked()

    // Delete
    await user.click(screen.getByRole('button', { name: 'Delete “Read 20 pages”' }))
    const confirm = screen.getByRole('dialog', { name: 'Delete this task?' })
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Task deleted.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Read 20 pages' })).not.toBeInTheDocument()
    expect(await tasksService.listTasks()).toEqual([])
  })

  // US-15 and US-16 through the page
  it('filters by status and moves an overdue task to today', async () => {
    await tasksService.createTask({ title: 'Open today', taskDate: '2026-10-14' })
    const done = await tasksService.createTask({ title: 'Done today', taskDate: '2026-10-14' })
    await tasksService.setTaskCompletion(done.id, true)
    await tasksService.createTask({ title: 'From Monday', taskDate: '2026-10-12' })
    const { user } = await openTasksPage()

    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(within(dayList()).getAllByRole('checkbox')).toHaveLength(1)
    expect(within(dayList()).getByRole('checkbox', { name: 'Done today' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Pending' }))
    await user.click(screen.getByRole('checkbox', { name: 'Open today' }))
    expect(await screen.findByText('Everything is done')).toBeInTheDocument()

    const overdue = screen.getByRole('region', { name: 'From earlier days (1)' })
    await user.click(within(overdue).getByRole('button', { name: 'Move to today: “From Monday”' }))
    expect(await screen.findByText('Moved to today.')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /From earlier days/ })).not.toBeInTheDocument()
    expect(within(dayList()).getByRole('checkbox', { name: 'From Monday' })).not.toBeChecked()
  })

  // IT-04 (NFR-21)
  it('rolls back an optimistic change and offers a retry when the service fails', async () => {
    await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()
    vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))

    await user.click(await screen.findByRole('checkbox', { name: 'Read' }))

    expect(await screen.findByText('We couldn’t reach the server. Check your connection and try again.')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Read' })).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Read' })).toBeChecked())
  })

  it('"Try again" uses the current version of the task, not the one from the failed attempt', async () => {
    await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()
    const save = vi.spyOn(tasksService, 'setTaskCompletion').mockRejectedValueOnce(new ServiceError('NETWORK'))
    await user.click(await screen.findByRole('checkbox', { name: 'Read' }))
    const retry = await screen.findByRole('button', { name: 'Try again' })

    // Rename the task while the failure toast is still open.
    await user.click(screen.getByRole('button', { name: 'Edit “Read”' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit task' })
    await user.type(within(dialog).getByLabelText('Title'), ' more{Enter}')
    await screen.findByRole('checkbox', { name: 'Read more' })

    // The retry is held, then fails too: neither the optimistic state nor the
    // rollback may bring back the old title (the old code showed "Read" in both).
    let failRetry
    save.mockImplementationOnce(() => new Promise((_, reject) => (failRetry = reject)))
    await user.click(retry)
    expect(screen.getByRole('checkbox', { name: 'Read more' })).toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Read' })).not.toBeInTheDocument()

    failRetry(new ServiceError('NETWORK'))
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Read more' })).not.toBeChecked())
    expect(screen.queryByRole('checkbox', { name: 'Read' })).not.toBeInTheDocument()
  })

  it('closes the edit dialog with a notice when the task no longer exists', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()
    await tasksService.deleteTask(task.id) // deleted in "another tab"

    await user.click(await screen.findByRole('button', { name: 'Edit “Read”' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit task' })
    await user.type(within(dialog).getByLabelText('Title'), ' more{Enter}')

    expect(await screen.findByText('This task no longer exists. The list has been updated.')).toBeInTheDocument()
    await waitFor(() => expect(dialog).not.toBeVisible())
    expect(screen.queryByRole('checkbox', { name: /Read/ })).not.toBeInTheDocument()
  })

  it('keeps an active filter visible on an empty day, so a new task is not hidden silently', async () => {
    await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()

    await user.click(await screen.findByRole('button', { name: 'Completed' }))
    await user.click(screen.getByRole('button', { name: 'Next day' }))

    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.type(screen.getByLabelText('New task'), 'Plan{Enter}')
    expect(await within(dayList()).findByRole('checkbox', { name: 'Plan' })).toBeInTheDocument()
  })

  it('tells the user when a task no longer exists, and drops it (SRS §4)', async () => {
    const task = await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()
    await tasksService.deleteTask(task.id) // deleted in "another tab"

    await user.click(await screen.findByRole('checkbox', { name: 'Read' }))

    expect(await screen.findByText('This task no longer exists. The list has been updated.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Read' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  // P3-T07: the loading state (USER_FLOW §9)
  it('shows a polite loading placeholder until the tasks arrive', async () => {
    let finishLoading
    vi.spyOn(tasksService, 'listTasks').mockReturnValueOnce(new Promise((resolve) => (finishLoading = resolve)))
    localStorage.setItem('mind.lang', 'en')
    window.history.pushState({}, '', '/tasks')
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByLabelText('New task')).not.toBeInTheDocument()

    finishLoading([])
    expect(await screen.findByLabelText('New task')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  // CT-05: filter-specific empty messages (US-15)
  it('explains an empty filter instead of showing a blank list', async () => {
    await tasksService.createTask({ title: 'Read', taskDate: '2026-10-14' })
    const { user } = await openTasksPage()

    await user.click(await screen.findByRole('button', { name: 'Completed' }))

    expect(screen.getByRole('heading', { name: 'No completed tasks yet' })).toBeInTheDocument()
    expect(screen.queryByText('Nothing planned for this day')).not.toBeInTheDocument()
  })

  it('shows a load error with a retry', async () => {
    vi.spyOn(tasksService, 'listTasks').mockRejectedValueOnce(new ServiceError('NETWORK'))
    localStorage.setItem('mind.lang', 'en')
    window.history.pushState({}, '', '/tasks')
    const user = setupUser()
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load your tasks.')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByLabelText('New task')).toBeInTheDocument()
  })
})
