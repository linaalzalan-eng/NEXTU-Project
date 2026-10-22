import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService, ServiceError } from '@/services'
import { renderApp } from '@/test/renderApp.jsx'

const SENT = 'If an account exists for lina@example.com, we sent it a link to set a new password. The link works once.'

async function openForgot() {
  const view = renderApp('/forgot-password', { signedIn: false })
  await screen.findByRole('heading', { level: 1, name: 'Reset your password' })
  return view
}

async function submitEmail(user, email = 'lina@example.com') {
  await user.type(screen.getByLabelText('Email'), email)
  await user.click(screen.getByRole('button', { name: 'Send reset link' }))
}

// CT-11, forgot part (US-26, FR-08, D-19)
describe('ForgotPasswordForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('checks VR-01 before sending', async () => {
    const request = vi.spyOn(authService, 'requestPasswordReset')
    const { user } = await openForgot()

    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter your email.')
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(request).not.toHaveBeenCalled()
  })

  it('always shows the same "if an account exists" message', async () => {
    const request = vi.spyOn(authService, 'requestPasswordReset')
    const { user } = await openForgot()

    await submitEmail(user, ' lina@example.com ')

    expect(await screen.findByRole('heading', { level: 1, name: 'Check your inbox' })).toHaveFocus()
    expect(screen.getByText(SENT)).toBeInTheDocument()
    expect(request).toHaveBeenCalledWith({ email: 'lina@example.com' })
  })

  it('offers Retry after a network error, and sends the same email again', async () => {
    const request = vi
      .spyOn(authService, 'requestPasswordReset')
      .mockRejectedValueOnce(new ServiceError('NETWORK'))
    const { user } = await openForgot()

    await submitEmail(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We couldn’t reach the server. Check your connection and try again.',
    )
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(SENT)).toBeInTheDocument()
    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenLastCalledWith({ email: 'lina@example.com' })
  })

  it('shows the same message when rate limited, which only happens to registered emails (D-30)', async () => {
    vi.spyOn(authService, 'requestPasswordReset').mockRejectedValueOnce(new ServiceError('RATE_LIMITED'))
    const { user } = await openForgot()

    await submitEmail(user)

    expect(await screen.findByText(SENT)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
