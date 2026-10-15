import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { getWeeklyStats } from '../lib/weeklyStats.js'
import { DailyChart } from './DailyChart.jsx'

const tasks = [
  makeTask({ taskDate: '2026-10-10', status: 'completed' }),
  makeTask({ taskDate: '2026-10-12' }),
]
const currentWeek = getWeeklyStats(tasks, '2026-10-10')
const previousWeek = getWeeklyStats(tasks, '2026-10-03') // no tasks

// NFR-44 text alternative; the drawing itself is checked in a browser.
describe('DailyChart', () => {
  it('describes both weeks in words and says "No tasks" instead of "0 of 0" (BR-06)', () => {
    renderWithProviders(<DailyChart currentWeek={currentWeek} previousWeek={previousWeek} today="2026-10-14" />)
    expect(screen.getByText('This week: 1 of 2 completed. Last week: No tasks.')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Day by day' })
    expect(within(table).getAllByRole('row')).toHaveLength(8) // header + 7 days
    expect(within(table).getByRole('row', { name: /Saturday/ })).toHaveTextContent('Saturday1 of 1 completedNo tasks')
  })

  it('renders the Arabic (RTL) version with the same numbers', () => {
    renderWithProviders(<DailyChart currentWeek={currentWeek} previousWeek={previousWeek} today="2026-10-14" />, {
      lang: 'ar',
    })
    expect(screen.getByRole('region', { name: 'يومًا بيوم' })).toBeInTheDocument()
    expect(screen.getByText('هذا الأسبوع: أُنجز 1 من 2. الأسبوع الماضي: لا مهام.')).toBeInTheDocument()
    expect(within(screen.getByRole('table')).getByRole('row', { name: /السبت/ })).toHaveTextContent('أُنجز 1 من 1')
    // The drawing is laid out LTR inside the RTL page (ChartCanvas, D-28).
    expect(document.querySelector('[aria-hidden="true"] > [dir="ltr"]')).not.toBeNull()
  })
})
