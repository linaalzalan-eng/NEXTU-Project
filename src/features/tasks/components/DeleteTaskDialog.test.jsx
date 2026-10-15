import { screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { DeleteTaskDialog } from './DeleteTaskDialog.jsx'

const TASK = makeTask({ title: 'Call the bank' })

function Harness({ onConfirm }) {
  const [deleting, setDeleting] = useState(null)
  return (
    <>
      <button type="button" onClick={() => setDeleting(TASK)}>
        Delete
      </button>
      <DeleteTaskDialog task={deleting} onConfirm={onConfirm} onClose={() => setDeleting(null)} />
    </>
  )
}

async function openDialog() {
  const onConfirm = vi.fn()
  const view = renderWithProviders(<Harness onConfirm={onConfirm} />)
  await view.user.click(screen.getByRole('button', { name: 'Delete' }))
  return { ...view, onConfirm, dialog: screen.getByRole('dialog', { name: 'Delete this task?' }) }
}

// CT-04 (US-12, BR-07)
describe('DeleteTaskDialog', () => {
  it('warns that deleting is permanent and affects past statistics', async () => {
    const { dialog } = await openDialog()

    expect(dialog).toHaveAccessibleDescription(
      'Deleting is permanent. The task also disappears from your past statistics.',
    )
    expect(screen.getByText('Call the bank')).toBeInTheDocument()
  })

  it('focuses Cancel first, the safe choice', async () => {
    await openDialog()
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('confirms the delete and closes', async () => {
    const { user, onConfirm, dialog } = await openDialog()

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledWith(TASK)
    expect(dialog).not.toBeVisible()
  })

  it('Cancel changes nothing', async () => {
    const { user, onConfirm, dialog } = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(dialog).not.toBeVisible()
  })
})
