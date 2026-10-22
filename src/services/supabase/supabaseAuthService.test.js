import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFakeSupabase } from '@/test/fakeSupabase.js'
import { ServiceError } from '../errors.js'
import { createSupabaseAuthService } from './supabaseAuthService.js'

const SUPABASE_USER = { id: 'user-a', email: 'a@example.com', role: 'authenticated', app_metadata: {} }
const SUPABASE_SESSION = { access_token: 'token', refresh_token: 'refresh', user: SUPABASE_USER }
const SESSION = { user: { id: 'user-a', email: 'a@example.com' }, isRecovery: false }

function setup({ linkToken = null } = {}) {
  const fake = createFakeSupabase({ session: SUPABASE_SESSION })
  const service = createSupabaseAuthService(fake.client, { origin: () => 'https://nextu.test', linkToken })
  return { ...fake, auth: fake.client.auth, service }
}

async function expectServiceError(promise, code) {
  const error = await promise.catch((caught) => caught)
  expect(error).toBeInstanceOf(ServiceError)
  expect(error.code).toBe(code)
  return error
}

/** An error shaped like supabase-js's AuthApiError. */
const apiError = (code, status = 400) => Object.assign(new Error(code), { name: 'AuthApiError', code, status })

// P5-T03, P5-T04, P5-T07 (API_CONTRACTS §3, D-18, D-19)
describe('createSupabaseAuthService', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('maps the session to the small contract shape, without tokens', async () => {
    const { service } = setup()
    expect(await service.getSession()).toEqual(SESSION)
  })

  describe('signUp', () => {
    it('sends the trimmed email and a confirmation link back to the app', async () => {
      const { service, auth } = setup()
      auth.signUp.mockResolvedValue({ data: { user: SUPABASE_USER, session: null }, error: null })

      const result = await service.signUp({ email: ' a@example.com ', password: '12345678' })

      expect(auth.signUp).toHaveBeenCalledWith({
        email: 'a@example.com',
        password: '12345678',
        options: { emailRedirectTo: 'https://nextu.test/dashboard' },
      })
      // "Confirm email" on: no session, and the page shows "check your email" (D-18).
      expect(result).toEqual({ user: SESSION.user, session: null })
    })

    it('returns the session when confirmation is off', async () => {
      const { service, auth } = setup()
      auth.signUp.mockResolvedValue({ data: { user: SUPABASE_USER, session: SUPABASE_SESSION }, error: null })
      expect((await service.signUp({ email: 'a@example.com', password: '12345678' })).session).toEqual(SESSION)
    })

    it('reports an existing email as EMAIL_TAKEN (confirmation off only)', async () => {
      const { service, auth } = setup()
      auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: apiError('user_already_exists', 422) })
      await expectServiceError(service.signUp({ email: 'a@example.com', password: '12345678' }), 'EMAIL_TAKEN')
    })

    it('validates before calling Supabase (VR-01, VR-02)', async () => {
      const { service, auth } = setup()
      await expectServiceError(service.signUp({ email: 'a@example.com', password: 'short' }), 'VALIDATION')
      expect(auth.signUp).not.toHaveBeenCalled()
    })
  })

  describe('signIn', () => {
    it('returns the session', async () => {
      const { service, auth } = setup()
      auth.signInWithPassword.mockResolvedValue({ data: { session: SUPABASE_SESSION }, error: null })
      expect(await service.signIn({ email: 'a@example.com', password: 'x' })).toEqual(SESSION)
    })

    it.each([
      [apiError('invalid_credentials'), 'INVALID_CREDENTIALS'],
      [apiError('email_not_confirmed'), 'EMAIL_NOT_CONFIRMED'],
      [apiError('over_request_rate_limit', 429), 'RATE_LIMITED'],
      [Object.assign(new Error('Failed to fetch'), { name: 'AuthRetryableFetchError', status: 0 }), 'NETWORK'],
      [apiError('unexpected_failure', 500), 'UNKNOWN'],
    ])('maps %s to %s, keeping the raw error only as the cause', async (raw, code) => {
      const { service, auth } = setup()
      auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: raw })
      const error = await expectServiceError(service.signIn({ email: 'a@example.com', password: 'x' }), code)
      expect(error.cause).toBe(raw)
    })

    it('treats a thrown network failure the same way', async () => {
      const { service, auth } = setup()
      auth.signInWithPassword.mockRejectedValue(Object.assign(new Error('offline'), { name: 'AuthRetryableFetchError' }))
      await expectServiceError(service.signIn({ email: 'a@example.com', password: 'x' }), 'NETWORK')
    })
  })

  it('signs out', async () => {
    const { service, auth } = setup()
    await service.signOut()
    expect(auth.signOut).toHaveBeenCalled()
  })

  describe('onAuthStateChange', () => {
    it('passes the mapped session and event, and unsubscribes', () => {
      const { service, emit, listenerCount } = setup()
      const callback = vi.fn()
      const before = listenerCount()
      const unsubscribe = service.onAuthStateChange(callback)

      emit('SIGNED_IN', SUPABASE_SESSION)
      emit('TOKEN_REFRESHED', SUPABASE_SESSION)
      emit('SIGNED_OUT', null)

      expect(callback.mock.calls).toEqual([
        [SESSION, 'SIGNED_IN'],
        [SESSION, 'OTHER'],
        [null, 'SIGNED_OUT'],
      ])
      unsubscribe()
      expect(listenerCount()).toBe(before)
    })
  })

  describe('password reset (D-19)', () => {
    it('asks for a link that opens /reset-password', async () => {
      const { service, auth } = setup()
      await service.requestPasswordReset({ email: ' a@example.com ' })
      expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('a@example.com', {
        redirectTo: 'https://nextu.test/reset-password',
      })
    })

    it('reports RATE_LIMITED when too many emails were sent', async () => {
      const { service, auth } = setup()
      auth.resetPasswordForEmail.mockResolvedValue({ data: null, error: apiError('over_email_send_rate_limit', 429) })
      await expectServiceError(service.requestPasswordReset({ email: 'a@example.com' }), 'RATE_LIMITED')
    })

    it('marks the session from a reset link as a recovery session, from the very first read', async () => {
      const { service } = setup({ linkToken: 'token' })
      expect(await service.getSession()).toEqual({ ...SESSION, isRecovery: true })
    })

    it('reads the reset link from the address when the service is created', async () => {
      window.history.replaceState(null, '', '/reset-password#access_token=token&type=recovery')
      const fake = createFakeSupabase({ session: SUPABASE_SESSION })
      const service = createSupabaseAuthService(fake.client)
      expect((await service.getSession()).isRecovery).toBe(true)
    })

    it('ignores a typed #type=recovery: an existing normal session stays normal (D-19)', async () => {
      window.history.replaceState(null, '', '/reset-password#type=recovery')
      const fake = createFakeSupabase({ session: SUPABASE_SESSION })
      expect((await createSupabaseAuthService(fake.client).getSession()).isRecovery).toBe(false)
    })

    it('ignores a forged token: the stored session does not carry it', async () => {
      const { service } = setup({ linkToken: 'forged-token' })
      expect((await service.getSession()).isRecovery).toBe(false)
    })

    it('stays a recovery session after the token is refreshed', async () => {
      const { service, emit } = setup({ linkToken: 'token' })
      const callback = vi.fn()
      service.onAuthStateChange(callback)
      expect((await service.getSession()).isRecovery).toBe(true)
      emit('TOKEN_REFRESHED', { ...SUPABASE_SESSION, access_token: 'refreshed' })
      expect(callback).toHaveBeenLastCalledWith({ ...SESSION, isRecovery: true }, 'OTHER')
    })

    it.each(['USER_UPDATED', 'SIGNED_OUT'])('ends the recovery session on %s', async (event) => {
      const { service, emit } = setup({ linkToken: 'token' })
      expect((await service.getSession()).isRecovery).toBe(true)
      emit(event, event === 'SIGNED_OUT' ? null : SUPABASE_SESSION)
      expect((await service.getSession()).isRecovery).toBe(false)
    })

    it('also learns it from a later PASSWORD_RECOVERY event', async () => {
      const { service, emit } = setup()
      const callback = vi.fn()
      service.onAuthStateChange(callback)
      emit('PASSWORD_RECOVERY', SUPABASE_SESSION)
      expect(callback).toHaveBeenLastCalledWith({ ...SESSION, isRecovery: true }, 'PASSWORD_RECOVERY')
      expect((await service.getSession()).isRecovery).toBe(true)
    })

    it('ends the recovery session once the new password is saved', async () => {
      const { service, auth } = setup({ linkToken: 'token' })
      auth.updateUser.mockResolvedValue({ data: { user: SUPABASE_USER }, error: null })

      await service.updatePassword({ password: 'new-password' })

      expect(auth.updateUser).toHaveBeenCalledWith({ password: 'new-password' })
      expect((await service.getSession()).isRecovery).toBe(false)
    })

    it.each([
      [Object.assign(new Error('Auth session missing!'), { name: 'AuthSessionMissingError', status: 400 }), 'UNAUTHENTICATED'],
      [apiError('same_password', 422), 'VALIDATION'],
      [apiError('weak_password', 422), 'VALIDATION'],
    ])('updatePassword maps %s to %s', async (raw, code) => {
      const { service, auth } = setup({ linkToken: 'token' })
      auth.updateUser.mockResolvedValue({ data: { user: null }, error: raw })
      await expectServiceError(service.updatePassword({ password: 'new-password' }), code)
    })

    it('a password login is a normal session, even after a reset link', async () => {
      const { service, auth } = setup({ linkToken: 'token' })
      auth.signInWithPassword.mockResolvedValue({ data: { session: SUPABASE_SESSION }, error: null })
      expect((await service.signIn({ email: 'a@example.com', password: 'x' })).isRecovery).toBe(false)
    })
  })
})
