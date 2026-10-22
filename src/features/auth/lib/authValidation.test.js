import { describe, expect, it } from 'vitest'
import {
  normalizeEmail,
  validateEmail,
  validateLoginInput,
  validateNewPassword,
  validateNewPasswordInput,
  validatePasswordConfirmation,
  validateRegisterInput,
  validateResetRequestInput,
} from './authValidation.js'

// UT-07 (VR-01, VR-02, VR-05)
describe('validateEmail (VR-01)', () => {
  it('requires an email, ignoring surrounding spaces', () => {
    expect(validateEmail('')).toBe('required')
    expect(validateEmail('   ')).toBe('required')
    expect(validateEmail(undefined)).toBe('required')
  })

  it('accepts a valid address, trimmed', () => {
    expect(validateEmail('  lina@example.com ')).toBeNull()
    expect(normalizeEmail('  lina@example.com ')).toBe('lina@example.com')
  })

  it.each(['lina', 'lina@', '@example.com', 'lina@example', 'li na@example.com', 'a@b@c.com'])(
    'rejects the malformed address %j',
    (email) => {
      expect(validateEmail(email)).toBe('invalid')
    },
  )

  it('allows 254 characters and rejects 255', () => {
    const domain = '@example.com'
    expect(validateEmail('a'.repeat(254 - domain.length) + domain)).toBeNull()
    expect(validateEmail('a'.repeat(255 - domain.length) + domain)).toBe('tooLong')
  })
})

describe('validateNewPassword (VR-02)', () => {
  it('requires a password', () => {
    expect(validateNewPassword('')).toBe('required')
    expect(validateNewPassword(undefined)).toBe('required')
  })

  it('needs at least 8 characters, counting an emoji as one', () => {
    expect(validateNewPassword('1234567')).toBe('tooShort')
    expect(validateNewPassword('12345678')).toBeNull()
    expect(validateNewPassword('😀😀😀😀😀😀😀')).toBe('tooShort')
  })

  it('allows 72 bytes and rejects 73', () => {
    expect(validateNewPassword('a'.repeat(72))).toBeNull()
    expect(validateNewPassword('a'.repeat(73))).toBe('tooLong')
    // Arabic letters take 2 bytes each in UTF-8: 36 fit, 37 do not (D-30).
    expect(validateNewPassword('ب'.repeat(36))).toBeNull()
    expect(validateNewPassword('ب'.repeat(37))).toBe('tooLong')
  })

  it('never trims: spaces count as characters', () => {
    expect(validateNewPassword('        ')).toBeNull()
  })
})

describe('validatePasswordConfirmation (VR-05)', () => {
  it('requires the confirmation and an exact match', () => {
    expect(validatePasswordConfirmation('secret-123', '')).toBe('required')
    expect(validatePasswordConfirmation('secret-123', 'secret-124')).toBe('mismatch')
    expect(validatePasswordConfirmation('secret-123', 'secret-123 ')).toBe('mismatch')
    expect(validatePasswordConfirmation('secret-123', 'secret-123')).toBeNull()
  })
})

describe('form validators', () => {
  it('register: VR-01 and VR-02 together', () => {
    expect(validateRegisterInput({ email: 'x', password: 'short' })).toEqual({ email: 'invalid', password: 'tooShort' })
    expect(validateRegisterInput({ email: 'lina@example.com', password: '12345678' })).toEqual({})
  })

  it('login: any non-empty password, so the length rules reveal nothing', () => {
    expect(validateLoginInput({ email: 'lina@example.com', password: '' })).toEqual({ password: 'required' })
    expect(validateLoginInput({ email: 'lina@example.com', password: '1' })).toEqual({})
  })

  it('forgot password: VR-01', () => {
    expect(validateResetRequestInput({ email: '' })).toEqual({ email: 'required' })
    expect(validateResetRequestInput({ email: 'lina@example.com' })).toEqual({})
  })

  it('new password: VR-02 and VR-05', () => {
    expect(validateNewPasswordInput({ password: '12345678', confirmPassword: '87654321' })).toEqual({
      confirmPassword: 'mismatch',
    })
    expect(validateNewPasswordInput({ password: '', confirmPassword: '' })).toEqual({
      password: 'required',
      confirmPassword: 'required',
    })
    expect(validateNewPasswordInput({ password: '12345678', confirmPassword: '12345678' })).toEqual({})
  })
})
