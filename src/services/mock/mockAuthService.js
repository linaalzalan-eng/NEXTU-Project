/**
 * Mock auth (API_CONTRACTS §3): one fixed demo user. It keeps the same shapes and
 * events as the Supabase service, so the auth screens and route guards can be used
 * and tested without a backend. Any email and password signs in as the demo user.
 *
 * The demo user starts signed in, so `npm run dev` with the mock opens the app directly
 * (as in Phases 3–4). Logging out is remembered in this browser until the next login.
 * The options exist for tests: a fake storage, or starting signed out.
 */
export const DEMO_USER = Object.freeze({ id: 'local-user', email: 'demo@nextu.local' })
export const SIGNED_OUT_STORAGE_KEY = 'nextu.mockSignedOut'

const demoSession = Object.freeze({ user: DEMO_USER })

export function createMockAuthService({ storage, signedIn } = {}) {
  const getStorage = () => storage ?? globalThis.localStorage
  const listeners = new Set()

  function readSignedIn() {
    if (signedIn !== undefined) return signedIn
    try {
      return getStorage().getItem(SIGNED_OUT_STORAGE_KEY) !== 'true'
    } catch {
      return true
    }
  }

  // Read from storage every time, so clearing storage (as the tests do) starts signed in again.
  const currentSession = () => (readSignedIn() ? demoSession : null)

  function setSession(next, event) {
    if (signedIn !== undefined) signedIn = Boolean(next)
    try {
      if (next) getStorage().removeItem(SIGNED_OUT_STORAGE_KEY)
      else getStorage().setItem(SIGNED_OUT_STORAGE_KEY, 'true')
    } catch {
      // Storage blocked: the state still holds for this page.
    }
    for (const listener of listeners) listener(next, event)
  }

  return {
    async signUp() {
      setSession(demoSession, 'SIGNED_IN')
      return { user: DEMO_USER, session: demoSession }
    },
    async signIn() {
      setSession(demoSession, 'SIGNED_IN')
      return demoSession
    },
    async signOut() {
      setSession(null, 'SIGNED_OUT')
    },
    async getSession() {
      return currentSession()
    },
    onAuthStateChange(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    async requestPasswordReset() {},
    async updatePassword() {},
  }
}

export const mockAuthService = createMockAuthService()
