import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { TodaySummary } from './TodaySummary.jsx'

/** The value under a <dt> label in the counts row. */
function count(label) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling.textContent
}

// CT-07 (FR-21, FR-22, BR-01, BR-06)
describe('TodaySummary', () => {
  it('shows the counts and the rate it is given', () => {
    renderWithProviders(<TodaySummary completed={2} remaining={1} total={3} rate={67} />)
    expect(screen.getByText('of today’s plan done')).toBeInTheDocument()
    expect(screen.getByText('67').closest('p')).toHaveTextContent('67%')
    expect(count('Done')).toBe('2')
    expect(count('Left')).toBe('1')
    expect(count('Planned')).toBe('3')
    expect(screen.getByRole('progressbar', { name: 'Today’s progress' })).toHaveAttribute('aria-valuenow', '67')
  })

  it('shows "—", never 0%, when there are no tasks (BR-06)', () => {
    renderWithProviders(<TodaySummary completed={0} remaining={0} total={0} rate={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.queryByText(/0%/)).not.toBeInTheDocument()
    expect(screen.getAllByText('No tasks yet').length).toBeGreaterThan(0)
    expect(count('Planned')).toBe('0')
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  it('is labelled as a section in Arabic', () => {
    renderWithProviders(<TodaySummary completed={1} remaining={1} total={2} rate={50} />, { lang: 'ar' })
    expect(screen.getByRole('region', { name: 'تقدّم اليوم' })).toBeInTheDocument()
  })
})
