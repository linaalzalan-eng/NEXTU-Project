import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { PersonalBest } from './PersonalBest.jsx'

const record = {
  bestDay: { date: '2026-10-05', completed: 4 },
  bestWeek: { weekStart: '2026-10-03', completed: 9 },
}

// CT-08 (FR-33, US-21, BR-05)
describe('PersonalBest', () => {
  it('shows the best day and best week with their dates', () => {
    renderWithProviders(<PersonalBest {...record} isTodayBest={false} isThisWeekBest={false} />)
    expect(screen.getByText('Best day', { selector: 'dt' }).nextElementSibling).toHaveTextContent('4Mon, Oct 5')
    expect(screen.getByText('Best week', { selector: 'dt' }).nextElementSibling).toHaveTextContent('9Week of Sat, Oct 3')
    expect(screen.queryByText(/best day so far/)).not.toBeInTheDocument()
  })

  it('celebrates when today or this week holds the record', () => {
    renderWithProviders(<PersonalBest {...record} isTodayBest isThisWeekBest />)
    expect(screen.getByText('Today is your best day so far.')).toBeInTheDocument()
    expect(screen.getByText('This is your best week so far.')).toBeInTheDocument()
  })

  it('has an encouraging empty state before the first completed task', () => {
    renderWithProviders(<PersonalBest bestDay={null} bestWeek={null} isTodayBest={false} isThisWeekBest={false} />)
    expect(screen.getByText(/No record yet/)).toBeInTheDocument()
    expect(screen.queryByText('Best day')).not.toBeInTheDocument()
  })
})
