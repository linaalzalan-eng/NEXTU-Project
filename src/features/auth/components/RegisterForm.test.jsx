import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService, ServiceError } from '@/services'
import { DEMO_USER } from '@/services/mock/mockAuthService.js'
import { renderApp } from '@/test/renderApp.jsx'

async function openRegister() {
  const view = renderApp('/register', { signedIn: false })
  await screen.findByRole('heading', { level: 1, name: 'Create your account' })
  return view
}

async function fillAndSubmit(user, { email = 'lina@example.com', password = 'secret-123' } = {}) {
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Create account' }))
}

// CT-10, register part (US-01, D-18)
describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('checks VR-01 and VR-02 before submitting', async () => {
    const signUp = vi.spyOn(authService, 'signUp')
    const { user } = await openRegister()

    await fillAndSubmit(user, { email: 'lina@example', password: '1234567' })

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email, like name@example.com.')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      '8 to 72 characters. Use at least 8 characters.',
    )
    expect(signUp).not.toHaveBeenCalled()
  })

  it('shows "check your email" when confirmation is required, whatever the email', async () => {
    vi.spyOn(authService, 'signUp').mockResolvedValueOnce({ user: DEMO_USER, session: null })
    const { user } = await openRegister()

    await fillAndSubmit(user, { email: ' lina@example.com' })

    const heading = await screen.findByRole('heading', { level: 1, name: 'Check your email' })
    expect(heading).toHaveFocus()
    expect(
      screen.getByText(
        'If lina@example.com can be used for a new account, we sent a confirmation link to it. Open the link to finish, then log in.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to log in' })).toHaveAttribute('href', '/login')
    expect(window.location.pathname).toBe('/register')
  })

  it('signs a new account in and opens /dashboard when confirmation is off', async () => {
    const { user } = await openRegister()
    await fillAndSubmit(user)
    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('says clearly that an email is taken (confirmation off only)', async () => {
    vi.spyOn(authService, 'signUp').mockRejectedValueOnce(new ServiceError('EMAIL_TAKEN'))
    const { user } = await openRegister()

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists. Log in instead.')
  })

  it('shows only a generic message when Supabase refuses the password itself', async () => {
    vi.spyOn(authService, 'signUp').mockRejectedValueOnce(new ServiceError('VALIDATION', 'weak_password: raw'))
    const { user } = await openRegister()

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent('Some details aren’t valid. Check them and try again.')
    expect(screen.queryByText(/weak_password/)).not.toBeInTheDocument()
  })

  it('shows a loading state while creating the account', async () => {
    vi.spyOn(authService, 'signUp').mockReturnValueOnce(new Promise(() => {}))
    const { user } = await openRegister()
    await fillAndSubmit(user)
    expect(screen.getByRole('button', { name: /Create account/ })).toHaveAttribute('aria-busy', 'true')
  })
})
