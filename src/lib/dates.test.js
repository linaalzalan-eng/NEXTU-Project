import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { addDays, isValidDateString, parseDate, startOfWeek, toDateString, todayLocal, WEEK_STARTS_ON } from './dates.js'

// UT-01 (D-10, BR-03, BR-10)
describe('dates', () => {
  describe('todayLocal', () => {
    it('formats the local calendar date with zero padding', () => {
      expect(todayLocal(new Date(2026, 0, 5, 9, 30))).toBe('2026-01-05')
    })
  })

  describe('toDateString / parseDate', () => {
    it('round-trips a date string through a UTC Date', () => {
      const date = parseDate('2026-10-14')
      expect(date.toISOString()).toBe('2026-10-14T00:00:00.000Z')
      expect(toDateString(date)).toBe('2026-10-14')
    })
  })

  describe('isValidDateString', () => {
    it.each(['2026-10-14', '2024-02-29', '2000-01-01'])('accepts %s', (value) => {
      expect(isValidDateString(value)).toBe(true)
    })

    it.each(['2026-02-29', '2026-13-01', '2026-04-31', '2026-1-5', '14/10/2026', '', null, undefined, 20261014])(
      'rejects %s',
      (value) => {
        expect(isValidDateString(value)).toBe(false)
      },
    )
  })

  describe('addDays', () => {
    it('crosses month and year boundaries', () => {
      expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
      expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
    })

    it('handles leap days', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
      expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
      expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    })

    it('adds many days at once', () => {
      expect(addDays('2026-10-14', 365)).toBe('2027-10-14')
    })
  })

  describe('startOfWeek', () => {
    it('uses Saturday as the first day (D-13)', () => {
      expect(WEEK_STARTS_ON).toBe(6)
    })

    // 2026-10-10 is a Saturday; 2026-10-16 is the Friday after it.
    it.each(['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'])(
      'returns Saturday 2026-10-10 for %s',
      (day) => {
        expect(startOfWeek(day)).toBe('2026-10-10')
      },
    )

    it('starts a new week on the next Saturday', () => {
      expect(startOfWeek('2026-10-17')).toBe('2026-10-17')
    })

    it('works across a year boundary', () => {
      // 2027-01-01 is a Friday; its week started on Saturday 2026-12-26.
      expect(startOfWeek('2027-01-01')).toBe('2026-12-26')
    })
  })

  it('compares date strings in calendar order', () => {
    expect('2026-09-30' < '2026-10-01').toBe(true)
    expect('2026-10-14' > '2026-10-09').toBe(true)
    expect(['2026-10-10', '2025-12-31', '2026-01-02'].sort()).toEqual(['2025-12-31', '2026-01-02', '2026-10-10'])
  })

  // Beirut moves its clocks at midnight, so a local midnight can be skipped or repeated.
  describe('in a time zone with daylight saving at midnight (Asia/Beirut)', () => {
    let previousTimeZone

    beforeAll(() => {
      previousTimeZone = process.env.TZ
      process.env.TZ = 'Asia/Beirut'
    })

    afterAll(() => {
      if (previousTimeZone === undefined) delete process.env.TZ
      else process.env.TZ = previousTimeZone
    })

    it('runs in that zone', () => {
      // 22:30 UTC is 01:30 the next day in Beirut (UTC+3 in October).
      expect(new Date(Date.UTC(2026, 9, 13, 22, 30)).getHours()).toBe(1)
    })

    it('todayLocal uses the local date, not the UTC date', () => {
      expect(todayLocal(new Date(Date.UTC(2026, 9, 13, 22, 30)))).toBe('2026-10-14')
    })

    it('todayLocal works on the day local midnight is skipped (spring forward)', () => {
      // On 2026-03-29, 00:00 does not exist in Beirut; JavaScript moves it to 01:00.
      expect(todayLocal(new Date(2026, 2, 29))).toBe('2026-03-29')
    })

    it('addDays does not get stuck on the day local midnight repeats (fall back)', () => {
      // Local-time math (midnight + 24 h) would land on 2026-10-24 23:00 and repeat the day.
      expect(addDays('2026-10-24', 1)).toBe('2026-10-25')
      expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
      expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    })

    it('startOfWeek is unchanged', () => {
      expect(startOfWeek('2026-10-29')).toBe('2026-10-24')
    })
  })
})
