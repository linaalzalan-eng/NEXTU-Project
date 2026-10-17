import { screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceError } from '@/services/errors.js'
import { makeTask } from '@/test/factories.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { TaskEditDialog } from './TaskEditDialog.jsx'

const TODAY = '2026-10-14'
const TASK = makeTask({ title: 'Read', taskDate: TODAY })

/** A tiny page: an Edit button that opens the dialog, like TasksPage does. */
function Harness({ onSave }) {
  const [editing, setEditing] = useState(null)
  return (
    <>
      <button type="button" onClick={() => setEditing(TASK)}>
        Edit
      </button>
      <TaskEditDialog task={editing} today={TODAY} onSave={onSave} onClose={() => setEditing(null)} />
    </>
  )
}

async function openDialog(onSave = vi.fn().mockResolvedValue()) {
  const view = renderWithProviders(<Harness onSave={onSave} />)
  const trigger = screen.getByRole('button', { name: 'Edit' })
  await view.user.click(trigger)
  return { ...view, onSave, trigger, dialog: screen.getByRole('dialog', { name: 'Edit task' }) }
}

// CT-03 (US-08, US-09, BR-08)
describe('TaskEditDialog', () => {
  it('opens prefilled with the task values', async () => {
    await openDialog()

    expect(screen.getByLabelText('Title')).toHaveValue('Read')
    expect(screen.getByLabelText('Date')).toHaveValue(TODAY)
  })

  it('saves only the changed fields, then closes', async () => {
    const { user, onSave, dialog } = await openDialog()

    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Read more')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(TASK, { title: 'Read more' })
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('reschedules with a new date (BR-08)', async () => {
    const { user, onSave } = await openDialog()

    await user.clear(screen.getByLabelText('Date'))
    await user.type(screen.getByLabelText('Date'), '2026-10-20')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith(TASK, { taskDate: '2026-10-20' })
  })

  it('saves with Enter in the title field', async () => {
    const { user, onSave } = await openDialog()

    await user.type(screen.getByLabelText('Title'), ' more{Enter}')

    expect(onSave).toHaveBeenCalledWith(TASK, { title: 'Read more' })
  })

  it('validates like the create form', async () => {
    const { user, onSave } = await openDialog()

    await user.clear(screen.getByLabelText('Title'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Title')).toHaveAccessibleDescription('Enter a title.')
  })

  it('Escape cancels without saving and returns focus to the trigger', async () => {
    const { user, onSave, dialog, trigger } = await openDialog()

    await user.type(screen.getByLabelText('Title'), ' changed')
    await user.keyboard('{Escape}')

    expect(onSave).not.toHaveBeenCalled()
    expect(dialog).not.toBeVisible()
    expect(trigger).toHaveFocus()
  })

  it('opens fresh after a cancelled edit', async () => {
    const { user } = await openDialog()
    await user.type(screen.getByLabelText('Title'), ' changed')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Title')).toHaveValue('Read')
  })

  // saveEdit resolves to null when the task is gone; the notice is the action's job (IT in TasksPage.test).
  it('closes when the save resolves without a task', async () => {
    const onSave = vi.fn().mockResolvedValue(null)
    const { user, dialog } = await openDialog(onSave)

    await user.type(screen.getByLabelText('Title'), ' more{Enter}')

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('clears a field error as soon as the field is edited, like the create form', async () => {
    const { user } = await openDialog()
    const title = screen.getByLabelText('Title')

    await user.clear(title)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(title).toHaveAttribute('aria-invalid', 'true')

    await user.type(title, 'R')
    expect(title).not.toHaveAttribute('aria-invalid')
  })

  it('moves focus to the invalid field', async () => {
    const { user } = await openDialog()

    await user.clear(screen.getByLabelText('Title'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByLabelText('Title')).toHaveFocus()
  })

  it('stays open and shows a friendly message when saving fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new ServiceError('NETWORK', 'socket hang up'))
    const { user, dialog } = await openDialog(onSave)

    await user.type(screen.getByLabelText('Title'), ' more')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t reach the server.')
    expect(dialog).toBeVisible()
    expect(screen.queryByText(/socket hang up/)).not.toBeInTheDocument()
  })
})
