import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService, ServiceError } from '@/services'
import { renderApp } from '@/test/renderApp.jsx'

async function openLogin(path = '/login') {
  const view = renderApp(path, { signedIn: false })
  await screen.findByRole('heading', { level: 1, name: 'Welcome back' })
  return view
}

async function fillAndSubmit(user, { email = 'lina@example.com', password = 'secret-123' } = {}) {
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (password) await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

// CT-10, login part (US-02, FR-07, D-18)
describe('LoginForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows inline errors, focuses the first one, and submits nothing', async () => {
    const signIn = vi.spyOn(authService, 'signIn')
    const { user } = await openLogin()

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter your email.')
    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription('Enter a password.')
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(signIn).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Email'), 'lina')
    expect(screen.getByLabelText('Email')).not.toHaveAccessibleDescription() // cleared while typing
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email, like name@example.com.')
  })

  it.each([
    ['INVALID_CREDENTIALS', 'The email or password is incorrect.'],
    ['EMAIL_NOT_CONFIRMED', 'Confirm your email first: open the link we sent you, then log in.'],
    ['NETWORK', 'We couldn’t reach the server. Check your connection and try again.'],
    ['RATE_LIMITED', 'Too many attempts. Wait a few minutes and try again.'],
    ['UNKNOWN', 'Something went wrong. Try again.'],
  ])('explains %s without revealing details', async (code, message) => {
    vi.spyOn(authService, 'signIn').mockRejectedValueOnce(new ServiceError(code, 'raw backend text'))
    const { user } = await openLogin()

    await fillAndSubmit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByText(/raw backend text/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeInTheDocument()
  })

  it('shows a loading state and ignores a second submit', async () => {
    let finish
    const signIn = vi
      .spyOn(authService, 'signIn')
      .mockReturnValueOnce(new Promise((resolve, reject) => (finish = () => reject(new ServiceError('NETWORK')))))
    const { user } = await openLogin()

    await fillAndSubmit(user)
    const button = screen.getByRole('button', { name: /Log in/ })
    expect(button).toHaveAttribute('aria-busy', 'true')
    await user.click(button)
    await user.keyboard('{Enter}')
    expect(signIn).toHaveBeenCalledTimes(1)

    finish()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Log in' })).not.toHaveAttribute('aria-busy'))
  })

  it('logs in and opens /dashboard', async () => {
    const signIn = vi.spyOn(authService, 'signIn')
    const { user } = await openLogin()

    await fillAndSubmit(user, { email: '  lina@example.com ' })

    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
    // An email field trims spaces itself; the services trim again for other callers.
    expect(signIn).toHaveBeenCalledWith({ email: 'lina@example.com', password: 'secret-123' })
  })

  it('links to "Forgot password?" (US-26) and to registration', async () => {
    await openLogin()
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password')
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/register')
  })
})
