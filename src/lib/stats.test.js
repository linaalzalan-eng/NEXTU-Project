import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { countTasksInRange, getDailyStats, toRate } from './stats.js'

// UT-04 (BR-01, BR-06)
describe('toRate', () => {
  it('is null when there are no tasks (BR-06)', () => {
    expect(toRate(0, 0)).toBeNull()
  })

  it('rounds the completed share to an integer percentage (BR-01)', () => {
    expect(toRate(0, 3)).toBe(0)
    expect(toRate(1, 3)).toBe(33)
    expect(toRate(2, 3)).toBe(67)
    expect(toRate(3, 3)).toBe(100)
    expect(toRate(1, 2)).toBe(50)
  })

  it('never shows 100% while a task is pending, or 0% after one is done', () => {
    expect(toRate(199, 200)).toBe(99)
    expect(toRate(1, 201)).toBe(1)
  })
})

describe('getDailyStats', () => {
  const day = '2026-10-14'

  it('counts only the tasks that belong to the day', () => {
    const tasks = [
      makeTask({ taskDate: day, status: 'completed' }),
      makeTask({ taskDate: day, status: 'completed' }),
      makeTask({ taskDate: day }),
      makeTask({ taskDate: '2026-10-13', status: 'completed' }),
      makeTask({ taskDate: '2026-10-15' }),
    ]
    expect(getDailyStats(tasks, day)).toEqual({ date: day, total: 3, completed: 2, remaining: 1, rate: 67 })
  })

  it('returns zero counts and a null rate for a day without tasks (BR-06)', () => {
    expect(getDailyStats([], day)).toEqual({ date: day, total: 0, completed: 0, remaining: 0, rate: null })
  })

  it('counts a task completed on a later day for its own date (BR-01)', () => {
    const late = makeTask({ taskDate: '2026-10-10', status: 'completed', completedAt: '2026-10-14T08:00:00.000Z' })
    expect(getDailyStats([late], '2026-10-10')).toMatchObject({ completed: 1, rate: 100 })
    expect(getDailyStats([late], '2026-10-14')).toMatchObject({ total: 0, rate: null })
  })
})

describe('countTasksInRange', () => {
  it('includes both ends of the range', () => {
    const tasks = ['2026-10-09', '2026-10-10', '2026-10-16', '2026-10-17'].map((taskDate) =>
      makeTask({ taskDate, status: 'completed' }),
    )
    expect(countTasksInRange(tasks, '2026-10-10', '2026-10-16')).toEqual({ total: 2, completed: 2, rate: 100 })
  })
})
