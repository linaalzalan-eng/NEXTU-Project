import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService, ServiceError } from '@/services'
import { DEMO_USER } from '@/services/mock/mockAuthService.js'
import { renderApp } from '@/test/renderApp.jsx'

const RECOVERY = { user: DEMO_USER, isRecovery: true }

/** Opens /reset-password as the email link does: with a recovery session. */
async function openFromResetLink() {
  vi.spyOn(authService, 'getSession').mockResolvedValue(RECOVERY)
  const view = renderApp('/reset-password')
  await screen.findByRole('heading', { level: 1, name: 'Set a new password' })
  return view
}

async function fillAndSave(user, { password = 'new-password', confirm = password } = {}) {
  if (password) await user.type(screen.getByLabelText('New password'), password)
  if (confirm) await user.type(screen.getByLabelText('Confirm new password'), confirm)
  await user.click(screen.getByRole('button', { name: 'Save password' }))
}

// CT-11, reset part, and IT-05 for /reset-password (US-26, FR-09, D-19)
describe('ResetPasswordPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('checks VR-02 and VR-05 before saving', async () => {
    const update = vi.spyOn(authService, 'updatePassword')
    const { user } = await openFromResetLink()

    await fillAndSave(user, { password: 'new-password', confirm: 'new-passw0rd' })
    expect(screen.getByLabelText('Confirm new password')).toHaveAccessibleDescription('The passwords don’t match.')

    await user.clear(screen.getByLabelText('New password'))
    await user.type(screen.getByLabelText('New password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Save password' }))
    expect(screen.getByLabelText('New password')).toHaveAccessibleDescription(
      '8 to 72 characters. Use at least 8 characters.',
    )
    expect(screen.getByLabelText('New password')).toHaveFocus()
    expect(update).not.toHaveBeenCalled()
  })

  it('saves the password with a loading state, then logs in and opens /dashboard', async () => {
    let finish
    const update = vi
      .spyOn(authService, 'updatePassword')
      .mockReturnValueOnce(new Promise((resolve) => (finish = resolve)))
    const { user } = await openFromResetLink()

    await fillAndSave(user)
    expect(screen.getByRole('button', { name: /Save password/ })).toHaveAttribute('aria-busy', 'true')
    finish()

    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(screen.getByText('Password updated. You are logged in.')).toBeInTheDocument()
    expect(update).toHaveBeenCalledWith({ password: 'new-password' })
  })

  it('shows "link invalid or expired" without a session', async () => {
    renderApp('/reset-password', { signedIn: false })

    expect(await screen.findByRole('heading', { level: 1, name: 'Link invalid or expired' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute('href', '/forgot-password')
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })

  it('sends a normal session to /dashboard, so no password can be changed there', async () => {
    renderApp('/reset-password')

    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
  })

  it('shows the expired state when the recovery session has ended (UNAUTHENTICATED)', async () => {
    vi.spyOn(authService, 'updatePassword').mockRejectedValueOnce(new ServiceError('UNAUTHENTICATED'))
    const { user } = await openFromResetLink()

    await fillAndSave(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Link invalid or expired' })).toBeInTheDocument()
  })

  it('explains a password Supabase refuses, such as the current one', async () => {
    vi.spyOn(authService, 'updatePassword').mockRejectedValueOnce(new ServiceError('VALIDATION', 'same_password'))
    const { user } = await openFromResetLink()

    await fillAndSave(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This password can’t be used. Choose a different one, not your current password.',
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save password' })).not.toHaveAttribute('aria-busy'))
  })
})
