import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { WeekComparison } from './WeekComparison.jsx'

const current = { from: '2026-10-10', to: '2026-10-14', total: 5, completed: 4, rate: 80 }
const previous = { from: '2026-10-03', to: '2026-10-07', total: 4, completed: 2, rate: 50 }

/** The value shown under a delta label (a <dt>/<dd> pair). */
function delta(label) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling
}

// CT-08 (FR-30, US-20, BR-04)
describe('WeekComparison', () => {
  it('shows both windows with their dates, counts, and rates', () => {
    renderWithProviders(<WeekComparison current={current} previous={previous} completedDelta={2} rateDelta={30} />)
    const card = screen.getByRole('region', { name: 'This week so far' })
    expect(within(card).getByText('Oct 10 – Oct 14')).toBeInTheDocument()
    expect(within(card).getByText('Oct 3 – Oct 7')).toBeInTheDocument()
    expect(within(card).getByText(/4 of 5 completed/)).toHaveTextContent('80%')
    expect(within(card).getByText(/2 of 4 completed/)).toHaveTextContent('50%')
  })

  it('marks a positive change with a plus sign, not only a color', () => {
    renderWithProviders(<WeekComparison current={current} previous={previous} completedDelta={2} rateDelta={30} />)
    expect(delta('Completed tasks, change from last week')).toHaveTextContent('+2')
    expect(delta('Completion rate, change in percentage points')).toHaveTextContent('+30')
  })

  it('marks a negative change with a minus sign', () => {
    renderWithProviders(<WeekComparison current={previous} previous={current} completedDelta={-2} rateDelta={-30} />)
    expect(delta('Completed tasks, change from last week')).toHaveTextContent('−2')
    expect(delta('Completion rate, change in percentage points')).toHaveTextContent('−30')
  })

  it('says "Not enough data" instead of a misleading number', () => {
    const empty = { from: '2026-10-03', to: '2026-10-07', total: 0, completed: 0, rate: null }
    renderWithProviders(<WeekComparison current={current} previous={empty} completedDelta={4} rateDelta={null} />)
    expect(delta('Completion rate, change in percentage points')).toHaveTextContent('Not enough data')
    expect(delta('Completed tasks, change from last week')).toHaveTextContent('+4')
    expect(screen.getByText(/0 of 0 completed/)).toHaveTextContent('—')
  })

  it('shows a single date when the window is one day (today is Saturday)', () => {
    const day = { from: '2026-10-10', to: '2026-10-10', total: 1, completed: 1, rate: 100 }
    renderWithProviders(<WeekComparison current={day} previous={previous} completedDelta={0} rateDelta={50} />)
    expect(screen.getByText('Oct 10')).toBeInTheDocument()
  })
})
