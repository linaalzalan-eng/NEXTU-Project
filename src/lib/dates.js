/**
 * Calendar-date helpers (D-10). A calendar day is a "YYYY-MM-DD" string.
 *
 * Only todayLocal() reads the local clock. Every other helper parses the string
 * as a UTC date, does the math in UTC, and formats it back. Local midnight can
 * be skipped by a daylight-saving jump in some time zones; UTC never is.
 * Strings in this format compare correctly with < and >.
 */

/** Weeks run Saturday to Friday (BR-03, D-13). 0 = Sunday … 6 = Saturday. */
export const WEEK_STARTS_ON = 6

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_PER_DAY = 24 * 60 * 60 * 1000

const pad = (value, length = 2) => String(value).padStart(length, '0')

/** Today's calendar date in the browser's time zone (BR-10). */
export function todayLocal(now = new Date()) {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Formats a Date created by parseDate() (UTC midnight) as "YYYY-MM-DD". */
export function toDateString(date) {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** "YYYY-MM-DD" → Date at UTC midnight. Format it with timeZone 'UTC'. */
export function parseDate(dateString) {
  const [, year, month, day] = DATE_PATTERN.exec(dateString)
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

/**
 * True for a real calendar date in "YYYY-MM-DD" form ("2026-02-30" is false).
 * The round trip also rejects years 0000–0099, which Date.UTC maps to 1900–1999.
 */
export function isValidDateString(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false
  return toDateString(parseDate(value)) === value
}

export function addDays(dateString, days) {
  return toDateString(new Date(parseDate(dateString).getTime() + days * MS_PER_DAY))
}

/** The Saturday on or before the given date (BR-03). */
export function startOfWeek(dateString) {
  const weekday = parseDate(dateString).getUTCDay()
  return addDays(dateString, -((weekday - WEEK_STARTS_ON + 7) % 7))
}
