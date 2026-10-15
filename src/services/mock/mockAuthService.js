/**
 * Mock auth (Phases 3–4, API_CONTRACTS §3): one fixed demo user who is always
 * signed in. It keeps the same shapes as the Supabase service in Phase 5.
 */
export const DEMO_USER = Object.freeze({ id: 'local-user', email: 'demo@nextu.local' })

const session = Object.freeze({ user: DEMO_USER })

export const mockAuthService = {
  async signUp() {
    return { user: DEMO_USER, session }
  },
  async signIn() {
    return session
  },
  async signOut() {},
  async getSession() {
    return session
  },
  onAuthStateChange() {
    return () => {}
  },
  async requestPasswordReset() {},
  async updatePassword() {},
}
