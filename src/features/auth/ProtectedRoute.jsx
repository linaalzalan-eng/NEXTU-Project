import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '@/components/layout/PageLoader.jsx'
import { TasksProvider } from '@/features/tasks/TasksProvider.jsx'
import { useAuth } from './useAuth.js'

/**
 * Guards the app pages (FR-05, US-05). While the saved session is restored it shows
 * a loader, never a flash of the login page (US-04). Without a session it sends the
 * visitor to /login and remembers where they wanted to go.
 *
 * The task list lives here, inside the guard, so tasks are loaded only with a session,
 * and `key` gives every user a fresh task state: a second account signed in without
 * a reload never sees the first account's tasks (D-29, D-30). Logging out unmounts it,
 * so the browser's Back button finds no data to show (US-03).
 */
export function ProtectedRoute() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader fullScreen />
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location }} />

  return (
    <TasksProvider key={user.id}>
      <Outlet />
    </TasksProvider>
  )
}

/**
 * Guards /login, /register, and /forgot-password (FR-06). A signed-in user goes to
 * the page they originally asked for (FR-05), or to /dashboard. This is also what
 * moves the user on after a successful login, so the forms never navigate themselves.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader fullScreen />
  if (status === 'authenticated') return <Navigate to={redirectTarget(location.state?.from)} replace />
  return <Outlet />
}

/** The remembered page, as a path; only paths inside this app, so a crafted state cannot send the user elsewhere. */
function redirectTarget(from) {
  const path = from?.pathname
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return '/dashboard'
  return `${path}${from.search ?? ''}${from.hash ?? ''}`
}
