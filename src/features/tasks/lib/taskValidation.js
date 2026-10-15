import { addDays, isValidDateString } from '@/lib/dates.js'

export const TITLE_MAX_LENGTH = 200
export const MIN_TASK_DATE = '2000-01-01'
export const MAX_DAYS_AHEAD = 365

export function normalizeTitle(title) {
  return typeof title === 'string' ? title.trim() : ''
}

/**
 * VR-03. Returns null when valid, otherwise an error code: 'required' | 'tooLong'.
 * Length counts characters the way PostgreSQL char_length does (an emoji is one),
 * so the client and the database constraint agree.
 */
export function validateTitle(title) {
  const value = normalizeTitle(title)
  if (value.length === 0) return 'required'
  if ([...value].length > TITLE_MAX_LENGTH) return 'tooLong'
  return null
}

/** The allowed task dates for a given today (BR-14). Also used for date input min/max. */
export function getTaskDateRange(today) {
  return { min: MIN_TASK_DATE, max: addDays(today, MAX_DAYS_AHEAD) }
}

/**
 * VR-04 and BR-14. Returns null when valid, otherwise 'required' | 'invalid' | 'outOfRange'.
 * Past dates are allowed, so users can log what they already did.
 */
export function validateTaskDate(taskDate, today) {
  if (!taskDate) return 'required'
  if (!isValidDateString(taskDate)) return 'invalid'
  const { min, max } = getTaskDateRange(today)
  if (taskDate < min || taskDate > max) return 'outOfRange'
  return null
}

/**
 * Validates the fields that are present. Returns an object of error codes by
 * field, which is empty when everything is valid: { title?: code, taskDate?: code }.
 * Pass `partial: true` to skip missing fields (an edit that changes only one).
 */
export function validateTaskInput(input, today, { partial = false } = {}) {
  const errors = {}
  if (!partial || 'title' in input) {
    const titleError = validateTitle(input.title)
    if (titleError) errors.title = titleError
  }
  if (!partial || 'taskDate' in input) {
    const dateError = validateTaskDate(input.taskDate, today)
    if (dateError) errors.taskDate = dateError
  }
  return errors
}
