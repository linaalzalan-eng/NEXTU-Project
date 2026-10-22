import { act, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService, ServiceError, tasksService } from '@/services'
import { makeTask } from '@/test/factories.js'
import { renderApp } from '@/test/renderApp.jsx'

const USER_A = { id: 'user-a', email: 'a@example.com' }
const USER_B = { id: 'user-b', email: 'b@example.com' }

const loginHeading = () => screen.findByRole('heading', { level: 1, name: 'Welcome back' })

async function logIn(user) {
  await user.type(screen.getByLabelText('Email'), 'lina@example.com')
  await user.type(screen.getByLabelText('Password'), 'secret-123')
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

// IT-05 from Phase 5 (FR-03 to FR-06, US-03 to US-05), and the per-user task state (D-29 M-1, D-30)
describe('route guards', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it.each(['/dashboard', '/tasks', '/analytics', '/', '/no-such-page'])(
    'sends a visitor from %s to /login',
    async (path) => {
      renderApp(path, { signedIn: false })
      expect(await loginHeading()).toBeInTheDocument()
      expect(window.location.pathname).toBe('/login')
    },
  )

  it('returns to the originally requested page after login (FR-05)', async () => {
    const { user } = renderApp('/tasks', { signedIn: false })
    await loginHeading()

    await logIn(user)

    expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/tasks')
  })

  it.each(['/login', '/register', '/forgot-password'])('sends a signed-in user from %s to /dashboard', async (path) => {
    renderApp(path)
    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/dashboard')
  })

  it('shows a loader while the session is restored, never the login page (US-04)', async () => {
    let restore
    vi.spyOn(authService, 'getSession').mockReturnValueOnce(new Promise((resolve) => (restore = resolve)))
    renderApp('/tasks')

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByRole('heading', { name: 'Welcome back' })).not.toBeInTheDocument()

    await act(async () => restore({ user: USER_A }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument()
  })

  it('does not load tasks without a session', async () => {
    const listTasks = vi.spyOn(tasksService, 'listTasks')
    renderApp('/dashboard', { signedIn: false })
    await loginHeading()
    expect(listTasks).not.toHaveBeenCalled()
  })

  it('logs out from the layout, drops the tasks, and keeps protected pages closed (US-03)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
    await tasksService.createTask({ title: 'Private task', taskDate: '2026-10-14' })
    const { user } = renderApp('/tasks')
    expect(await screen.findByRole('checkbox', { name: 'Private task' })).toBeInTheDocument()

    const [sideButton] = screen.getAllByRole('button', { name: 'Log out' })
    await user.click(sideButton)

    expect(await loginHeading()).toBeInTheDocument()
    expect(screen.queryByText('Private task')).not.toBeInTheDocument()

    // Like pressing Back: the protected address opens the login page again, not the data.
    await act(async () => {
      window.history.pushState({}, '', '/tasks')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(await loginHeading()).toBeInTheDocument()
    expect(screen.queryByText('Private task')).not.toBeInTheDocument()
  })

  it('treats a logout as done when the server is unreachable but the session is gone', async () => {
    const { user } = renderApp('/dashboard')
    await screen.findByRole('heading', { level: 1, name: 'Today' })
    vi.spyOn(authService, 'signOut').mockRejectedValueOnce(new ServiceError('NETWORK'))
    vi.spyOn(authService, 'getSession').mockResolvedValue(null)

    await user.click(screen.getAllByRole('button', { name: 'Log out' })[0])

    expect(await loginHeading()).toBeInTheDocument()
    expect(screen.queryByText('We couldn’t reach the server. Check your connection and try again.')).not.toBeInTheDocument()
  })

  it('stays signed in and explains when logging out fails', async () => {
    const { user } = renderApp('/dashboard')
    await screen.findByRole('heading', { level: 1, name: 'Today' })
    vi.spyOn(authService, 'signOut').mockRejectedValueOnce(new ServiceError('NETWORK'))

    await user.click(screen.getAllByRole('button', { name: 'Log out' })[0])

    expect(await screen.findByText('We couldn’t reach the server. Check your connection and try again.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('re-reads the session when the browser restores the page from its back/forward cache (US-03)', async () => {
    renderApp('/dashboard')
    await screen.findByRole('heading', { level: 1, name: 'Today' })

    // Logged out on another page (this page heard nothing), then Back brings this page back as it was.
    vi.spyOn(authService, 'getSession').mockResolvedValue(null)
    await act(async () => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })

    expect(await loginHeading()).toBeInTheDocument()
  })

  it('gives each account its own task list, even when one session replaces another directly (D-29 M-1)', async () => {
    // For example, another tab signs in as B while this tab shows A: no logout in between,
    // so only `key={user.id}` can drop A's tasks.
    let announce
    vi.spyOn(authService, 'onAuthStateChange').mockImplementation((callback) => {
      announce = callback
      return () => {}
    })
    vi.spyOn(authService, 'getSession').mockResolvedValue({ user: USER_A })
    const listTasks = vi
      .spyOn(tasksService, 'listTasks')
      .mockResolvedValueOnce([makeTask({ id: 'a-1', userId: USER_A.id, title: 'Task of A', taskDate: '2026-10-14' })])
      .mockResolvedValueOnce([makeTask({ id: 'b-1', userId: USER_B.id, title: 'Task of B', taskDate: '2026-10-14' })])
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 14, 9, 0))
    renderApp('/tasks')
    expect(await screen.findByRole('checkbox', { name: 'Task of A' })).toBeInTheDocument()

    await act(async () => announce({ user: USER_B }, 'SIGNED_IN'))

    const list = await screen.findByRole('region', { name: 'Wednesday, October 14' })
    expect(await within(list).findByRole('checkbox', { name: 'Task of B' })).toBeInTheDocument()
    expect(screen.queryByText('Task of A')).not.toBeInTheDocument()
    expect(listTasks).toHaveBeenCalledTimes(2)
  })
})
