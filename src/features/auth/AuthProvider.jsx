import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services'
import { AuthContext } from './AuthContext.js'

/**
 * Knows who is signed in (US-04). On start it restores the session saved in this
 * browser, and it follows every later change: login, logout, a token refresh, a
 * session that ended in another tab, or a reset link (onAuthStateChange).
 *
 * The actions also apply the session they get back at once, so a page that checks
 * `status` right after `await signIn()` already sees the new state.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState('loading')

  const applySession = useCallback((next) => {
    setSession(next)
    setStatus(next ? 'authenticated' : 'unauthenticated')
  }, [])

  useEffect(() => {
    let ignore = false
    function restore() {
      authService
        .getSession()
        .then((restored) => {
          if (!ignore) applySession(restored)
        })
        .catch(() => {
          // A session that cannot be restored is treated as no session: the user logs in again.
          if (!ignore) applySession(null)
        })
    }

    // The callback only stores state. Calling the auth service from inside it can deadlock Supabase.
    const unsubscribe = authService.onAuthStateChange((next) => applySession(next))
    restore()

    // The browser's back/forward cache can bring back a page exactly as it was in memory,
    // still signed in, after the user logged out on another page (US-03). Such a page
    // reads the saved session again before showing anything.
    function handlePageShow(event) {
      if (!event.persisted) return
      setStatus('loading')
      restore()
    }
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      ignore = true
      unsubscribe()
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [applySession])

  const signIn = useCallback(
    async (input) => {
      const next = await authService.signIn(input)
      applySession(next)
      return next
    },
    [applySession],
  )

  /** With "Confirm email" on there is no session yet (D-18), and the state stays signed out. */
  const signUp = useCallback(
    async (input) => {
      const result = await authService.signUp(input)
      if (result.session) applySession(result.session)
      return result
    },
    [applySession],
  )

  /**
   * Supabase removes the session from this browser even when it cannot reach the
   * server to revoke it. If the session is gone, the logout worked, so no error is shown.
   */
  const signOut = useCallback(async () => {
    try {
      await authService.signOut()
    } catch (caught) {
      const remaining = await authService.getSession().catch(() => null)
      if (remaining) throw caught
    }
    applySession(null)
  }, [applySession])

  const requestPasswordReset = useCallback((input) => authService.requestPasswordReset(input), [])

  /** After the new password is saved, the recovery session becomes a normal one (D-19). */
  const updatePassword = useCallback(async (input) => {
    await authService.updatePassword(input)
    setSession((current) => current && { ...current, isRecovery: false })
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      status,
      isRecovery: Boolean(session?.isRecovery),
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
    }),
    [session, status, signIn, signUp, signOut, requestPasswordReset, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
