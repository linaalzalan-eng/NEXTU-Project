import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { TaskForm } from './TaskForm.jsx'

const TODAY = '2026-10-14'

function setup(props = {}) {
  // Like useTaskActions.create: resolves with the saved task.
  const onCreate = vi.fn(async (input) => ({ id: 'saved', ...input }))
  const view = renderWithProviders(<TaskForm defaultDate={TODAY} today={TODAY} onCreate={onCreate} {...props} />)
  return { onCreate, ...view, title: screen.getByLabelText('New task'), date: screen.getByLabelText('Date') }
}

// CT-01 (US-07, VR-03, VR-04)
describe('TaskForm', () => {
  it('submits with Enter, then clears the title and keeps focus', async () => {
    const { user, onCreate, title } = setup()

    await user.type(title, 'Read 10 pages{Enter}')

    expect(onCreate).toHaveBeenCalledWith({ title: 'Read 10 pages', taskDate: TODAY })
    expect(title).toHaveValue('')
    expect(title).toHaveFocus()
  })

  it('defaults the date to the viewed day', () => {
    const { date } = setup({ defaultDate: '2026-10-20' })
    expect(date).toHaveValue('2026-10-20')
  })

  it('shows an inline error for an empty title and does not submit', async () => {
    const { user, onCreate, title } = setup()

    await user.type(title, '   {Enter}')

    expect(onCreate).not.toHaveBeenCalled()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription('Enter a title.')
    expect(title).toHaveFocus()
  })

  it('clears the title error as soon as the user types', async () => {
    const { user, title } = setup()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(title).toHaveAttribute('aria-invalid', 'true')

    await user.type(title, 'R')
    expect(title).not.toHaveAttribute('aria-invalid')
  })

  it('rejects a date outside the allowed range (BR-14)', async () => {
    const { user, onCreate, title, date } = setup()

    await user.clear(date)
    await user.type(date, '2028-01-01')
    await user.type(title, 'Plan far ahead{Enter}')

    expect(onCreate).not.toHaveBeenCalled()
    expect(date).toHaveAccessibleDescription('Choose a date between 1 January 2000 and one year from today.')
  })

  it('clears the date error when the date changes', async () => {
    const { user, title, date } = setup()
    await user.clear(date)
    await user.type(title, 'Read{Enter}')
    expect(date).toHaveAttribute('aria-invalid', 'true')

    await user.type(date, '2026-10-15')
    expect(date).not.toHaveAttribute('aria-invalid')
  })

  it('does not confirm another day when saving failed', async () => {
    const onCreate = vi.fn(async () => undefined)
    const { user, title, date } = setup({ onCreate })

    await user.clear(date)
    await user.type(date, '2026-10-16')
    await user.type(title, 'Call the bank{Enter}')
    await onCreate.mock.results[0].value

    expect(screen.queryByText('Task added to October 16.')).not.toBeInTheDocument()
  })

  it('confirms where the task went when it is added to another day', async () => {
    const { user, onCreate, title, date } = setup()

    await user.clear(date)
    await user.type(date, '2026-10-16')
    await user.type(title, 'Call the bank{Enter}')

    expect(onCreate).toHaveBeenCalledWith({ title: 'Call the bank', taskDate: '2026-10-16' })
    expect(await screen.findByText('Task added to October 16.')).toBeInTheDocument()
  })
})
