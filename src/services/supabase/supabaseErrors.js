import { ServiceError } from '../errors.js'

/**
 * Turns Supabase errors into ServiceError codes (API_CONTRACTS §2). The raw
 * error is kept in `cause` for developers and never shown to users (NFR-14).
 * Codes are matched, never message text, as the Supabase docs advise.
 */

// Supabase Auth error codes → our codes. Anything not listed becomes UNKNOWN.
const AUTH_CODES = {
  invalid_credentials: 'INVALID_CREDENTIALS',
  email_not_confirmed: 'EMAIL_NOT_CONFIRMED',
  user_already_exists: 'EMAIL_TAKEN',
  email_exists: 'EMAIL_TAKEN',
  over_email_send_rate_limit: 'RATE_LIMITED',
  over_request_rate_limit: 'RATE_LIMITED',
  over_sms_send_rate_limit: 'RATE_LIMITED',
  weak_password: 'VALIDATION',
  same_password: 'VALIDATION',
  email_address_invalid: 'VALIDATION',
  validation_failed: 'VALIDATION',
  session_not_found: 'UNAUTHENTICATED',
  session_expired: 'UNAUTHENTICATED',
  refresh_token_not_found: 'UNAUTHENTICATED',
  bad_jwt: 'UNAUTHENTICATED',
}

/** For errors returned by supabase.auth.* calls. */
export function toAuthServiceError(error) {
  if (error instanceof ServiceError) return error
  // The request never reached the server (offline, DNS, blocked).
  if (error?.name === 'AuthRetryableFetchError' || error?.status === 0) {
    return new ServiceError('NETWORK', error.message, error)
  }
  // Raised by the client itself when there is no session, for example updatePassword without a recovery link.
  if (error?.name === 'AuthSessionMissingError') return new ServiceError('UNAUTHENTICATED', error.message, error)
  const code = AUTH_CODES[error?.code] ?? (error?.status === 429 ? 'RATE_LIMITED' : 'UNKNOWN')
  return new ServiceError(code, error?.message, error)
}

// PostgreSQL / PostgREST error codes → our codes.
const DATABASE_CODES = {
  23514: 'VALIDATION', // check_violation: title length, status, completed_at (NFR-20)
  23502: 'VALIDATION', // not_null_violation
  22001: 'VALIDATION', // string_data_right_truncation
  '22P02': 'VALIDATION', // invalid_text_representation, e.g. a malformed uuid or date
  22007: 'VALIDATION', // invalid_datetime_format
  22008: 'VALIDATION', // datetime_field_overflow
  42501: 'UNAUTHENTICATED', // insufficient_privilege / RLS: no valid signed-in user
  PGRST301: 'UNAUTHENTICATED', // JWT invalid or expired
  PGRST303: 'UNAUTHENTICATED', // JWT expired
}

/** For the `error` of a supabase.from(...) response. Pass the whole response, which carries `status`. */
export function toDatabaseServiceError({ error, status }) {
  if (status === 0) return new ServiceError('NETWORK', error?.message, error)
  const code = DATABASE_CODES[error?.code] ?? (status === 401 ? 'UNAUTHENTICATED' : 'UNKNOWN')
  return new ServiceError(code, error?.message, error)
}
