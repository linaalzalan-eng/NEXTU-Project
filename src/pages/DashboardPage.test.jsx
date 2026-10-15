import { act, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App.jsx'
import { TASKS_STORAGE_KEY } from '@/services/mock/mockTasksService.js'
import { makeTask } from '@/test/factories.js'
import { setupUser } from '@/test/setupUser.js'

/** Saves tasks where the mock service reads them, then opens the Dashboard in English. */
async function openDashboard(tasks = []) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  localStorage.setItem('mind.lang', 'en')
  window.history.pushState({}, '', '/dashboard')
  const user = setupUser()
  render(<App />)
  await screen.findByRole('region', { name: 'Today’s progress' })
  return { user }
}

const hero = () => screen.getByRole('region', { name: 'Today’s progress' })
const count = (label) => within(hero()).getByText(label, { selector: 'dt' }).nextElementSibling.textContent
const message = () => screen.getByRole('region', { name: 'A word for today' })

describe('Dashboard (integration)', () => {
  beforeEach(() => {
    // Only Date is faked, so "today" is Wednesday 2026-10-14 while timers stay real.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // IT-02 (US-17, US-18, BR-01, BR-13)
  it('updates the counts, rate, progress bar, and message when a task is toggled', async () => {
    const { user } = await openDashboard([
      makeTask({ title: 'Read', taskDate: '2026-10-14', status: 'completed' }),
      makeTask({ title: 'Run', taskDate: '2026-10-14' }),
      makeTask({ title: 'Write', taskDate: '2026-10-14' }),
      makeTask({ title: 'Tomorrow', taskDate: '2026-10-15' }),
    ])

    expect(within(hero()).getByText('33').closest('p')).toHaveTextContent('33%')
    expect([count('Done'), count('Left'), count('Planned')]).toEqual(['1', '2', '3'])
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33')
    expect(message()).toHaveTextContent('Good start. Keep the momentum going.')
    expect(screen.queryByRole('checkbox', { name: 'Tomorrow' })).not.toBeInTheDocument()

    // Manual script step 2: 2 of 3 = 67%
    await user.click(screen.getByRole('checkbox', { name: 'Run' }))
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67'))
    expect([count('Done'), count('Left'), count('Planned')]).toEqual(['2', '1', '3'])
    expect(message()).toHaveTextContent('More than halfway there.')

    await user.click(screen.getByRole('checkbox', { name: 'Write' }))
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100'))
    expect(message()).toHaveTextContent('Plan complete.')

    // Unchecking goes back (BR-12).
    await user.click(screen.getByRole('checkbox', { name: 'Read' }))
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67'))
  })

  it('adds a task for today with quick add (FR-20)', async () => {
    const { user } = await openDashboard()
    expect(within(hero()).getByText('—')).toBeInTheDocument()
    expect(screen.getByText('Plan your day')).toBeInTheDocument()
    expect(message()).toHaveTextContent('A fresh page.')

    await user.type(screen.getByLabelText('New task'), 'Call the bank{Enter}')
    expect(await screen.findByRole('checkbox', { name: 'Call the bank' })).not.toBeChecked()
    await waitFor(() => expect(count('Planned')).toBe('1'))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(message()).toHaveTextContent('The first step is the hardest.')
  })

  it('shows the overdue count with a link to the Tasks page (FR-24, BR-09)', async () => {
    await openDashboard([
      makeTask({ taskDate: '2026-10-12' }),
      makeTask({ taskDate: '2026-10-13' }),
      makeTask({ taskDate: '2026-10-13', status: 'completed' }),
    ])
    expect(screen.getByText('Open tasks from earlier days: 2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review in Tasks' })).toHaveAttribute('href', '/tasks')
  })

  // IT-06 (BR-10)
  it('moves to the new day when the page becomes visible after midnight', async () => {
    await openDashboard([
      makeTask({ title: 'Read', taskDate: '2026-10-14', status: 'completed' }),
      makeTask({ title: 'Run', taskDate: '2026-10-14' }),
      makeTask({ title: 'Plan', taskDate: '2026-10-15' }),
    ])
    expect(screen.getByText('Wednesday, October 14')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    expect(screen.queryByText(/Open tasks from earlier days/)).not.toBeInTheDocument()

    // The tab was hidden overnight; it is shown again the next morning.
    vi.setSystemTime(new Date(2026, 9, 15, 7, 30))
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(await screen.findByText('Thursday, October 15')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Read' })).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    // Yesterday's unfinished task is now overdue.
    expect(screen.getByText('Open tasks from earlier days: 1')).toBeInTheDocument()
    // Quick add now defaults to the new day.
    expect(screen.getByLabelText('Date')).toHaveValue('2026-10-15')
  })
})
