import { render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App.jsx'
import { TASKS_STORAGE_KEY } from '@/services/mock/mockTasksService.js'
import { makeTask } from '@/test/factories.js'
import { setupUser } from '@/test/setupUser.js'

const done = (title, taskDate) => makeTask({ title, taskDate, status: 'completed' })
const open = (title, taskDate) => makeTask({ title, taskDate })

/*
 * Known dataset. Today is Wednesday 2026-10-14; weeks run Saturday–Friday (BR-03).
 *
 * This week (Sat 10-10 … Fri 10-16)       Last week (Sat 10-03 … Fri 10-09)
 *   Sat 10-10  A ✓  B ✓                    Sat 10-03  H ✓
 *   Tue 10-13  C ✓  D ○                    Tue 10-06  I ✓  J ✓  K ✓
 *   Wed 10-14  E ✓  F ○   ← today          Wed 10-07  L ○
 *   Thu 10-15  G ○        (future)         Thu 10-08  M ✓   (after the "so far" window)
 * Two weeks ago: Tue 09-29  N ✓ O ✓ P ✓ Q ✓
 *
 * Hand calculation:
 *   This week so far (10-10…10-14): 4 of 6 → 67%.  Last week so far (10-03…10-07): 4 of 5 → 80%.
 *   Deltas: 4 − 4 = 0 tasks; 67 − 80 = −13 points (BR-04).
 *   Full weeks for the chart: this week 4 of 7, last week 5 of 6.
 *   Best day: Tue 09-29 with 4. Best week: 10-03 with 5 (09-26 week has 4, this week 4) (BR-05).
 *   8-week trend: 4 + 5 + 4 = 13 completed; strongest week starts Oct 3 with 5.
 */
const DATASET = [
  done('A', '2026-10-10'),
  done('B', '2026-10-10'),
  done('C', '2026-10-13'),
  open('D', '2026-10-13'),
  done('E', '2026-10-14'),
  open('F', '2026-10-14'),
  open('G', '2026-10-15'),
  done('H', '2026-10-03'),
  done('I', '2026-10-06'),
  done('J', '2026-10-06'),
  done('K', '2026-10-06'),
  open('L', '2026-10-07'),
  done('M', '2026-10-08'),
  ...['N', 'O', 'P', 'Q'].map((title) => done(title, '2026-09-29')),
]

async function openAnalytics(tasks) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  localStorage.setItem('mind.lang', 'en')
  window.history.pushState({}, '', '/analytics')
  const user = setupUser()
  render(<App />)
  await screen.findByRole('heading', { level: 1, name: 'Analytics' })
  return { user }
}

const comparison = () => screen.getByRole('region', { name: 'This week so far' })
const term = (container, label) => within(container).getByText(label, { selector: 'dt' }).nextElementSibling

describe('Analytics (integration)', () => {
  // The page is lazy-loaded with Recharts (NFR-03). Loading it once up front keeps the
  // first test from spending its 3 s findBy budget on the import when the machine is busy.
  // Cold Recharts imports exceeded the default 10 s hook timeout under load.
  // Match the existing 30 s test budget without changing assertion timeouts.
  beforeAll(async () => {
    await import('@/pages/AnalyticsPage.jsx')
  }, 30_000)

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // IT-03 (US-19 to US-22, BR-02 to BR-06, BR-11)
  it('computes the comparison, personal best, and charts from the tasks, and follows changes', async () => {
    const { user } = await openAnalytics(DATASET)

    // Week comparison, to date (BR-04)
    expect(await within(await screen.findByRole('region', { name: 'This week so far' })).findByText(/4 of 6 completed/)).toHaveTextContent('67%')
    expect(within(comparison()).getByText(/4 of 5 completed/)).toHaveTextContent('80%')
    expect(term(comparison(), 'Completed tasks, change from last week')).toHaveTextContent('0')
    expect(term(comparison(), 'Completion rate, change in percentage points')).toHaveTextContent('−13')

    // Personal best (BR-05)
    const best = screen.getByRole('region', { name: 'Personal best' })
    expect(term(best, 'Best day')).toHaveTextContent('4Tue, Sep 29')
    expect(term(best, 'Best week')).toHaveTextContent('5Week of Sat, Oct 3')

    // Chart text alternatives (NFR-44): full weeks
    expect(screen.getByText('This week: 4 of 7 completed. Last week: 5 of 6 completed.')).toBeInTheDocument()
    expect(
      screen.getByText('In the last 8 weeks you completed 13 tasks. Your strongest week started on Oct 3, with 5 completed.'),
    ).toBeInTheDocument()
    const dailyTable = screen.getByRole('table', { name: 'Day by day' })
    expect(within(dailyTable).getByRole('row', { name: /Tuesday/ })).toHaveTextContent(
      'Tuesday1 of 2 completed3 of 3 completed',
    )
    expect(within(dailyTable).getByRole('row', { name: /Sunday/ })).toHaveTextContent('SundayNo tasksNo tasks')
    const trendTable = screen.getByRole('table', { name: 'The last 8 weeks' })
    expect(within(trendTable).getAllByRole('row')).toHaveLength(9) // header + 8 weeks
    expect(within(trendTable).getByRole('row', { name: /Aug 22/ })).toHaveTextContent('Aug 2200—')
    expect(within(trendTable).getByRole('row', { name: /Oct 3/ })).toHaveTextContent('Oct 35683%')

    // BR-11: change past tasks on the Tasks page, then come back.
    await user.click(screen.getAllByRole('link', { name: 'Tasks' })[0])
    await user.click(await screen.findByRole('button', { name: 'Move to today: “L”' }))
    await screen.findByText('Moved to today.')

    await user.click(screen.getByRole('button', { name: 'Previous day' }))
    await user.click(screen.getByRole('button', { name: 'Delete “C”' }))
    const confirm = screen.getByRole('dialog', { name: 'Delete this task?' })
    await user.click(within(confirm).getByRole('button', { name: 'Delete' }))
    await screen.findByText('Task deleted.')

    await user.click(screen.getAllByRole('link', { name: 'Analytics' })[0])
    // This week so far: A B (10-10) + D (10-13) + E F L (10-14) → 3 of 6 = 50%.
    // Last week so far: H + I J K → 4 of 4 = 100%. Deltas: −1 task, −50 points.
    await waitFor(() => expect(within(comparison()).getByText(/3 of 6 completed/)).toHaveTextContent('50%'))
    expect(within(comparison()).getByText(/4 of 4 completed/)).toHaveTextContent('100%')
    expect(term(comparison(), 'Completed tasks, change from last week')).toHaveTextContent('−1')
    expect(term(comparison(), 'Completion rate, change in percentage points')).toHaveTextContent('−50')
  })

  it('shows an encouraging empty state when there are no tasks', async () => {
    await openAnalytics([])
    expect(await screen.findByText('Your story starts with your first completed task')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Tasks' })).toHaveAttribute('href', '/tasks')
  })

  it('says "Not enough data" and shows no record before anything is completed', async () => {
    await openAnalytics([open('First', '2026-10-14')])
    expect(await within(await screen.findByRole('region', { name: 'This week so far' })).findByText(/0 of 1 completed/)).toHaveTextContent('0%')
    expect(term(comparison(), 'Completion rate, change in percentage points')).toHaveTextContent('Not enough data')
    expect(screen.getByText(/No record yet/)).toBeInTheDocument()
    expect(screen.getByText('No completed tasks in the last 8 weeks yet.')).toBeInTheDocument()
  })
})
