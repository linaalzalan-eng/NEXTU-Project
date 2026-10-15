import { describe, expect, it } from 'vitest'
import { getTaskDateRange, normalizeTitle, validateTaskDate, validateTaskInput, validateTitle } from './taskValidation.js'

const TODAY = '2026-10-14'

// UT-02 (VR-03, VR-04, BR-14)
describe('taskValidation', () => {
  describe('validateTitle (VR-03)', () => {
    it.each([
      ['an empty title', '', 'required'],
      ['whitespace only', '   \t\n ', 'required'],
      ['a missing title', undefined, 'required'],
    ])('rejects %s', (_, title, code) => {
      expect(validateTitle(title)).toBe(code)
    })

    it('accepts exactly 200 characters and rejects 201', () => {
      expect(validateTitle('a'.repeat(200))).toBeNull()
      expect(validateTitle('a'.repeat(201))).toBe('tooLong')
    })

    it('measures the length after trimming', () => {
      expect(validateTitle(`  ${'a'.repeat(200)}  `)).toBeNull()
    })

    it('counts an emoji as one character, like PostgreSQL', () => {
      // '🌱' is two UTF-16 units, so .length would be 400 here.
      expect(validateTitle('🌱'.repeat(200))).toBeNull()
      expect(validateTitle('🌱'.repeat(201))).toBe('tooLong')
    })

    it('accepts Arabic and mixed text', () => {
      expect(validateTitle('قراءة 20 صفحة — Atomic Habits')).toBeNull()
    })

    it('normalizeTitle trims surrounding whitespace only', () => {
      expect(normalizeTitle('  Read  10 pages ')).toBe('Read  10 pages')
    })
  })

  describe('validateTaskDate (VR-04, BR-14)', () => {
    it.each([
      ['empty', '', 'required'],
      ['missing', undefined, 'required'],
      ['in the wrong format', '14/10/2026', 'invalid'],
      ['not a real day', '2026-02-30', 'invalid'],
      ['before 2000-01-01', '1999-12-31', 'outOfRange'],
      ['more than 365 days ahead', '2027-10-15', 'outOfRange'],
    ])('rejects a date that is %s', (_, value, code) => {
      expect(validateTaskDate(value, TODAY)).toBe(code)
    })

    it.each([
      ['the first allowed day', '2000-01-01'],
      ['a past date', '2026-10-01'],
      ['today', TODAY],
      ['exactly 365 days ahead', '2027-10-14'],
    ])('accepts %s', (_, value) => {
      expect(validateTaskDate(value, TODAY)).toBeNull()
    })

    it('exposes the allowed range for date inputs', () => {
      expect(getTaskDateRange(TODAY)).toEqual({ min: '2000-01-01', max: '2027-10-14' })
    })
  })

  describe('validateTaskInput', () => {
    it('returns an empty object for valid input', () => {
      expect(validateTaskInput({ title: 'Read', taskDate: TODAY }, TODAY)).toEqual({})
    })

    it('returns every field error', () => {
      expect(validateTaskInput({ title: ' ', taskDate: 'nope' }, TODAY)).toEqual({ title: 'required', taskDate: 'invalid' })
    })

    it('checks only the fields that are present when partial', () => {
      expect(validateTaskInput({ taskDate: TODAY }, TODAY, { partial: true })).toEqual({})
      expect(validateTaskInput({ title: '' }, TODAY, { partial: true })).toEqual({ title: 'required' })
    })
  })
})
