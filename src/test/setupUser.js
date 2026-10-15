import userEvent from '@testing-library/user-event'

/**
 * The userEvent instance every test uses. `delay: null` types each character
 * without waiting for a timer in between. Typing stays realistic (every key
 * still fires keydown, input, and keyup), but it no longer slows down when the
 * machine is busy, which made long tests time out under load (PROGRESS.md).
 */
export function setupUser() {
  return userEvent.setup({ delay: null })
}
