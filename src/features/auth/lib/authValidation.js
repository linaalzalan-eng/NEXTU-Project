export const EMAIL_MAX_LENGTH = 254
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_BYTES = 72

// Deliberately simple: one @, something on each side, a dot in the domain.
// Supabase Auth checks the address again on the server (SRS §3 notes).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const utf8 = new TextEncoder()

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim() : ''
}

/** VR-01. Returns null when valid, otherwise 'required' | 'invalid' | 'tooLong'. */
export function validateEmail(email) {
  const value = normalizeEmail(email)
  if (value.length === 0) return 'required'
  if (value.length > EMAIL_MAX_LENGTH) return 'tooLong'
  if (!EMAIL_PATTERN.test(value)) return 'invalid'
  return null
}

/**
 * VR-02 for a new password (register and reset). Returns null, 'required', 'tooShort', or 'tooLong'.
 * Passwords are never trimmed: a space is a valid character.
 * The minimum counts characters. The maximum counts UTF-8 bytes, because the
 * server's password hashing (bcrypt) stops at 72 bytes; for Latin letters and
 * digits that is the same as 72 characters (D-30).
 */
export function validateNewPassword(password) {
  if (typeof password !== 'string' || password.length === 0) return 'required'
  if ([...password].length < PASSWORD_MIN_LENGTH) return 'tooShort'
  if (utf8.encode(password).length > PASSWORD_MAX_BYTES) return 'tooLong'
  return null
}

/** VR-05. Returns null, 'required', or 'mismatch'. */
export function validatePasswordConfirmation(password, confirmation) {
  if (typeof confirmation !== 'string' || confirmation.length === 0) return 'required'
  if (confirmation !== password) return 'mismatch'
  return null
}

/** Collects field errors into an object that is empty when everything is valid. */
function collect(checks) {
  const errors = {}
  for (const [field, error] of Object.entries(checks)) {
    if (error) errors[field] = error
  }
  return errors
}

/** Register (US-01): VR-01 and VR-02. */
export function validateRegisterInput({ email, password }) {
  return collect({ email: validateEmail(email), password: validateNewPassword(password) })
}

/** Login (US-02): a valid email and any non-empty password. Length rules would reveal nothing useful here. */
export function validateLoginInput({ email, password }) {
  return collect({
    email: validateEmail(email),
    password: typeof password === 'string' && password.length > 0 ? null : 'required',
  })
}

/** Forgot password (US-26): VR-01. */
export function validateResetRequestInput({ email }) {
  return collect({ email: validateEmail(email) })
}

/** New password (US-26): VR-02 and VR-05. */
export function validateNewPasswordInput({ password, confirmPassword }) {
  return collect({
    password: validateNewPassword(password),
    confirmPassword: validatePasswordConfirmation(password, confirmPassword),
  })
}
