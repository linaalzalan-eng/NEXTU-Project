import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { OverdueSection } from './OverdueSection.jsx'

// CT-05, part 3 (FR-17, US-16, BR-09)
describe('OverdueSection', () => {
  const tasks = [
    makeTask({ title: 'Call the bank', taskDate: '2026-10-12' }),
    makeTask({ title: 'Send the proposal', taskDate: '2026-10-13' }),
  ]

  it('lists the overdue tasks with their planned day', () => {
    renderWithProviders(<OverdueSection tasks={tasks} onToggle={vi.fn()} onMoveToToday={vi.fn()} />)

    const section = screen.getByRole('region', { name: 'From earlier days (2)' })
    const rows = within(section).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Call the bank')
    expect(rows[0]).toHaveTextContent('Planned for Mon, Oct 12')
  })

  it('moves a task to today in one action', async () => {
    const onMoveToToday = vi.fn()
    const { user } = renderWithProviders(<OverdueSection tasks={tasks} onToggle={vi.fn()} onMoveToToday={onMoveToToday} />)

    const row = screen.getByText('Send the proposal').closest('li')
    await user.click(within(row).getByRole('button', { name: 'Move to today: “Send the proposal”' }))

    expect(onMoveToToday).toHaveBeenCalledWith(tasks[1])
  })

  it('disables "Move to today" while the task is unsaved or busy', () => {
    const unsaved = makeTask({ id: 'temp-9', title: 'Unsaved', taskDate: '2026-10-12' })
    renderWithProviders(
      <OverdueSection tasks={[unsaved, tasks[1]]} busyIds={new Set([tasks[1].id])} onToggle={vi.fn()} onMoveToToday={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Move to today: “Unsaved”' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move to today: “Send the proposal”' })).toBeDisabled()
  })

  it('can complete an overdue task directly', async () => {
    const onToggle = vi.fn()
    const { user } = renderWithProviders(<OverdueSection tasks={tasks} onToggle={onToggle} onMoveToToday={vi.fn()} />)

    await user.click(screen.getByRole('checkbox', { name: 'Call the bank' }))

    expect(onToggle).toHaveBeenCalledWith(tasks[0], true)
  })

  it('renders nothing when there are no overdue tasks', () => {
    renderWithProviders(<OverdueSection tasks={[]} onToggle={vi.fn()} onMoveToToday={vi.fn()} />)
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(screen.queryByText(/From earlier days/)).not.toBeInTheDocument()
  })
})
