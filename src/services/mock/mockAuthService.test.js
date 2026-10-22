import { describe, expect, it, vi } from 'vitest'
import { createMockAuthService, DEMO_USER, SIGNED_OUT_STORAGE_KEY } from './mockAuthService.js'

// API_CONTRACTS §3: the mock keeps the real service's shapes and events.
describe('mockAuthService', () => {
  it('starts signed in as the demo user', async () => {
    expect(await createMockAuthService().getSession()).toEqual({ user: DEMO_USER })
  })

  it('remembers a logout in storage until the next login, and tells subscribers', async () => {
    const service = createMockAuthService()
    const callback = vi.fn()
    const unsubscribe = service.onAuthStateChange(callback)

    await service.signOut()
    expect(await service.getSession()).toBeNull()
    expect(localStorage.getItem(SIGNED_OUT_STORAGE_KEY)).toBe('true')
    expect(await createMockAuthService().getSession()).toBeNull() // after a reload

    await service.signIn({ email: 'any@example.com', password: 'anything' })
    expect(await service.getSession()).toEqual({ user: DEMO_USER })
    expect(callback.mock.calls).toEqual([
      [null, 'SIGNED_OUT'],
      [{ user: DEMO_USER }, 'SIGNED_IN'],
    ])

    unsubscribe()
    await service.signOut()
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('can start signed out, for tests', async () => {
    const service = createMockAuthService({ signedIn: false })
    expect(await service.getSession()).toBeNull()
    const result = await service.signUp({ email: 'a@example.com', password: '12345678' })
    expect(result).toEqual({ user: DEMO_USER, session: { user: DEMO_USER } })
    expect(await service.getSession()).toEqual({ user: DEMO_USER })
  })
})
