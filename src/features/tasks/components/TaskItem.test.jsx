import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { TaskItem } from './TaskItem.jsx'

function setup(task, props = {}) {
  const handlers = { onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() }
  const view = renderWithProviders(
    <ul>
      <TaskItem task={task} {...handlers} {...props} />
    </ul>,
  )
  return { ...handlers, ...view }
}

// CT-02 (US-10, US-11, US-12)
describe('TaskItem', () => {
  it('is a checkbox named by the task title', () => {
    setup(makeTask({ title: 'Read 10 pages' }))
    expect(screen.getByRole('checkbox', { name: 'Read 10 pages' })).not.toBeChecked()
  })

  it('toggles with a click', async () => {
    const task = makeTask({ title: 'Read' })
    const { user, onToggle } = setup(task)

    await user.click(screen.getByRole('checkbox', { name: 'Read' }))

    expect(onToggle).toHaveBeenCalledWith(task, true)
  })

  it('toggles with Space on the focused checkbox, and can be undone (US-11)', async () => {
    const task = makeTask({ title: 'Read', status: 'completed' })
    const { user, onToggle } = setup(task)

    await user.tab()
    expect(screen.getByRole('checkbox', { name: 'Read' })).toHaveFocus()
    await user.keyboard(' ')

    expect(onToggle).toHaveBeenCalledWith(task, false)
  })

  it('marks a completed task with more than color: checked state and strike-through', () => {
    setup(makeTask({ title: 'Read', status: 'completed' }))

    expect(screen.getByRole('checkbox', { name: 'Read' })).toBeChecked()
    expect(screen.getByText('Read')).toHaveClass('line-through')
  })

  it('names Edit and Delete with the task title', async () => {
    const task = makeTask({ title: 'Read' })
    const { user, onEdit, onDelete } = setup(task)

    await user.click(screen.getByRole('button', { name: 'Edit “Read”' }))
    await user.click(screen.getByRole('button', { name: 'Delete “Read”' }))

    expect(onEdit).toHaveBeenCalledWith(task)
    expect(onDelete).toHaveBeenCalledWith(task)
  })

  it('locks its controls while a new task is still being saved', async () => {
    const { user, onToggle } = setup(makeTask({ id: 'temp-1', title: 'Read' }))
    const checkbox = screen.getByRole('checkbox', { name: 'Read' })

    // aria-disabled, not disabled, so the checkbox keeps keyboard focus.
    expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    await user.click(checkbox)
    expect(onToggle).not.toHaveBeenCalled()
    expect(checkbox).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Edit “Read”' })).toBeDisabled()
  })

  it('locks its controls while a request for it is in flight (busy)', async () => {
    const { user, onToggle } = setup(makeTask({ title: 'Read' }), { busy: true })

    await user.click(screen.getByRole('checkbox', { name: 'Read' }))

    expect(onToggle).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Delete “Read”' })).toBeDisabled()
  })

  it('renders user text in its own direction', () => {
    setup(makeTask({ title: 'قراءة' }))
    expect(screen.getByText('قراءة')).toHaveAttribute('dir', 'auto')
  })

  it('is read-only without onToggle and states the status in words', () => {
    renderWithProviders(
      <ul>
        <TaskItem task={makeTask({ title: 'Read', status: 'completed' })} />
      </ul>,
    )
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Completed')).toHaveClass('sr-only')
  })
})
