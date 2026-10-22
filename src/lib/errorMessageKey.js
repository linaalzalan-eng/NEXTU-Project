const KEYS = {
  VALIDATION: 'errors.validation',
  NOT_FOUND: 'errors.notFound',
  NETWORK: 'errors.network',
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  EMAIL_NOT_CONFIRMED: 'errors.emailNotConfirmed',
  EMAIL_TAKEN: 'errors.emailTaken',
  RATE_LIMITED: 'errors.rateLimited',
  UNAUTHENTICATED: 'errors.unauthenticated',
}

/**
 * Maps a ServiceError code to a translated, user-safe message key (SRS §4, NFR-14).
 * Anything unexpected becomes the generic message; details never reach the screen.
 */
export function errorMessageKey(error) {
  return KEYS[error?.code] ?? 'errors.unknown'
}
