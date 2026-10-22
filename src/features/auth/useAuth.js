import { useContext } from 'react'
import { AuthContext } from './AuthContext.js'

/**
 * The signed-in state: { user, session, status, isRecovery } and the actions
 * { signIn, signUp, signOut, requestPasswordReset, updatePassword }.
 * `status` is 'loading' (the saved session is being restored) | 'authenticated' | 'unauthenticated'.
 * `isRecovery` is true only for the temporary session from a password reset link (D-19).
 * The actions reject with a ServiceError; the forms decide what to show.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
