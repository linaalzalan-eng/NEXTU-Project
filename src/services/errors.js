/** Stable error codes shared by every service (API_CONTRACTS §2). */
export const ERROR_CODES = Object.freeze([
  'VALIDATION',
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'EMAIL_NOT_CONFIRMED',
  'EMAIL_TAKEN',
  'NOT_FOUND',
  'RATE_LIMITED',
  'NETWORK',
  'UNKNOWN',
])

/**
 * The only error type services throw. The UI decides what to show from `code`;
 * `message` and `cause` are for developers and are never shown to users (NFR-14).
 */
export class ServiceError extends Error {
  constructor(code, message, cause) {
    super(message ?? code, { cause })
    this.name = 'ServiceError'
    this.code = ERROR_CODES.includes(code) ? code : 'UNKNOWN'
  }
}
