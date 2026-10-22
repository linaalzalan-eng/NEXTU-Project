import {
  normalizeEmail,
  validateLoginInput,
  validateNewPassword,
  validateRegisterInput,
  validateResetRequestInput,
} from '@/features/auth/lib/authValidation.js'
import { ServiceError } from '../errors.js'
import { toAuthServiceError } from './supabaseErrors.js'

/** Supabase's user object → the small shape in API_CONTRACTS §1. */
const toUser = (user) => (user ? { id: user.id, email: user.email } : null)

/**
 * The access token in a password reset link (implicit flow: `#access_token=…&type=recovery`),
 * or null. The token, not just `type=recovery`, is what proves the session came from the
 * email: anyone can type `#type=recovery` into the address bar of a signed-in browser.
 */
function resetLinkToken() {
  try {
    const params = new URLSearchParams(window.location.hash.slice(1))
    return params.get('type') === 'recovery' ? params.get('access_token') : null
  } catch {
    return null
  }
}

function assertValid(errors) {
  const fields = Object.keys(errors)
  if (fields.length > 0) {
    throw new ServiceError('VALIDATION', fields.map((field) => `${field}: ${errors[field]}`).join(', '))
  }
}

/** supabase-js returns { data, error } instead of throwing; this turns the error into a ServiceError. */
async function call(request) {
  let result
  try {
    result = await request()
  } catch (caught) {
    throw toAuthServiceError(caught)
  }
  if (result.error) throw toAuthServiceError(result.error)
  return result.data
}

/**
 * Auth service backed by Supabase Auth (API_CONTRACTS §3). `client` is the Supabase
 * client; tests pass a fake. `origin` builds the links in confirmation and reset emails,
 * which must also be listed as redirect URLs in the Supabase dashboard (D-18, D-19).
 */
export function createSupabaseAuthService(
  client,
  { origin = () => window.location.origin, linkToken = resetLinkToken() } = {},
) {
  // A reset link signs the user in with a temporary recovery session (D-19). The app
  // must know this from the very first session it sees, or /reset-password would treat
  // it as a normal session and redirect. Supabase announces it only once, with
  // PASSWORD_RECOVERY, which can arrive after that first session. So the link's token
  // is read here, when the service is created: right after the client, before the
  // client has removed it from the address bar. A session counts as recovery only if it
  // carries exactly that token, so a typed or forged link cannot turn an existing normal
  // session into one (D-30).
  let recovery = false
  let pendingLinkToken = linkToken
  client.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') recovery = true
    // The new password was saved, or the user left: the recovery session is over.
    if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
      recovery = false
      pendingLinkToken = null
    }
  })

  /** Supabase's session → API_CONTRACTS §1: `isRecovery` is true only for a session from a reset link. */
  function toSession(session) {
    if (!session) return null
    if (pendingLinkToken && session.access_token === pendingLinkToken) {
      recovery = true
      pendingLinkToken = null
    }
    return { user: toUser(session.user), isRecovery: recovery }
  }

  function toAuthEvent(event) {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') return event
    return 'OTHER'
  }

  return {
    /** With "Confirm email" on, session is null and Supabase does not say whether the email was new (D-18). */
    async signUp({ email, password }) {
      assertValid(validateRegisterInput({ email, password }))
      const data = await call(() =>
        client.auth.signUp({
          email: normalizeEmail(email),
          password,
          options: { emailRedirectTo: `${origin()}/dashboard` },
        }),
      )
      return { user: toUser(data.user), session: toSession(data.session) }
    },

    async signIn({ email, password }) {
      assertValid(validateLoginInput({ email, password }))
      // A password login is a normal session, even in a tab opened from a reset link.
      recovery = false
      pendingLinkToken = null
      const data = await call(() => client.auth.signInWithPassword({ email: normalizeEmail(email), password }))
      return toSession(data.session)
    },

    async signOut() {
      await call(() => client.auth.signOut())
    },

    /** Reads the session saved in this browser (US-04). */
    async getSession() {
      const data = await call(() => client.auth.getSession())
      return toSession(data.session)
    },

    /** The callback only stores state; it must not call Supabase itself, which can deadlock the client. */
    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        callback(toSession(session), toAuthEvent(event))
      })
      return () => data.subscription.unsubscribe()
    },

    /** Resolves the same way whether or not the email is registered (D-19). */
    async requestPasswordReset({ email }) {
      assertValid(validateResetRequestInput({ email }))
      await call(() =>
        client.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: `${origin()}/reset-password` }),
      )
    },

    /** Needs the recovery session from the reset link; without it Supabase reports a missing session. */
    async updatePassword({ password }) {
      const error = validateNewPassword(password)
      if (error) throw new ServiceError('VALIDATION', `password: ${error}`)
      await call(() => client.auth.updateUser({ password }))
      recovery = false
      pendingLinkToken = null
    },
  }
}
