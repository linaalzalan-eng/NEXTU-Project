import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { compareWeeksToDate, getWeekRange, getWeeklyHistory, getWeeklyStats, summarizeHistory } from './weeklyStats.js'

/** n tasks on one date, the first `done` of them completed. */
function tasksOn(taskDate, n, done = 0) {
  return Array.from({ length: n }, (_, index) => makeTask({ taskDate, status: index < done ? 'completed' : 'pending' }))
}

// Calendar used below (D-13): Saturday 2026-10-10 … Friday 2026-10-16 is "this week"
// when today is Wednesday 2026-10-14. Last week is Saturday 2026-10-03 … Friday 2026-10-09.

// UT-05 (BR-02, BR-03, BR-04, BR-06)
describe('getWeekRange (BR-03)', () => {
  it.each([
    ['2026-10-10', 'Saturday'],
    ['2026-10-14', 'Wednesday'],
    ['2026-10-16', 'Friday'],
  ])('puts %s (%s) in the Saturday–Friday week', (date) => {
    expect(getWeekRange(date)).toEqual({ weekStart: '2026-10-10', weekEnd: '2026-10-16' })
  })

  it('starts a new week on Saturday and crosses month and year ends', () => {
    expect(getWeekRange('2026-10-17').weekStart).toBe('2026-10-17')
    expect(getWeekRange('2027-01-01')).toEqual({ weekStart: '2026-12-26', weekEnd: '2027-01-01' })
  })
})

describe('getWeeklyStats', () => {
  it('aggregates the week instead of averaging the days (BR-02)', () => {
    // Day A 1/1 (100%), day B 0/9 (0%): the average of days would be 50%; the week is 1/10.
    const tasks = [...tasksOn('2026-10-10', 1, 1), ...tasksOn('2026-10-11', 9, 0)]
    const week = getWeeklyStats(tasks, '2026-10-10')
    expect(week).toMatchObject({ weekStart: '2026-10-10', weekEnd: '2026-10-16', total: 10, completed: 1, rate: 10 })
  })

  it('has seven days, Saturday first, with empty days as null rates (BR-06)', () => {
    const tasks = [...tasksOn('2026-10-12', 3, 2), ...tasksOn('2026-10-09', 4, 4), ...tasksOn('2026-10-17', 2, 2)]
    const { days, total } = getWeeklyStats(tasks, '2026-10-10')
    expect(total).toBe(3)
    expect(days.map((day) => day.date)).toEqual([
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
    ])
    expect(days[0]).toEqual({ date: '2026-10-10', total: 0, completed: 0, remaining: 0, rate: null })
    expect(days[2]).toEqual({ date: '2026-10-12', total: 3, completed: 2, remaining: 1, rate: 67 })
  })

  it('gives a week without tasks a null rate (BR-06)', () => {
    expect(getWeeklyStats([], '2026-10-10')).toMatchObject({ total: 0, completed: 0, rate: null })
  })
})

describe('compareWeeksToDate (BR-04)', () => {
  it('compares Saturday-to-today with the same weekdays last week', () => {
    const tasks = [
      ...tasksOn('2026-10-10', 2, 2), // this week, counted
      ...tasksOn('2026-10-14', 3, 1), // today, counted
      ...tasksOn('2026-10-15', 4, 0), // later this week: not part of "so far"
      ...tasksOn('2026-10-03', 2, 1), // last Saturday, counted
      ...tasksOn('2026-10-07', 2, 2), // last Wednesday, counted
      ...tasksOn('2026-10-08', 5, 5), // last Thursday: after the window
    ]
    expect(compareWeeksToDate(tasks, '2026-10-14')).toEqual({
      current: { from: '2026-10-10', to: '2026-10-14', total: 5, completed: 3, rate: 60 },
      previous: { from: '2026-10-03', to: '2026-10-07', total: 4, completed: 3, rate: 75 },
      completedDelta: 0,
      rateDelta: -15,
    })
  })

  it('uses one day each when today is Saturday', () => {
    const tasks = [...tasksOn('2026-10-10', 2, 1), ...tasksOn('2026-10-03', 4, 1), ...tasksOn('2026-10-04', 9, 9)]
    const result = compareWeeksToDate(tasks, '2026-10-10')
    expect(result.current).toMatchObject({ from: '2026-10-10', to: '2026-10-10', completed: 1, rate: 50 })
    expect(result.previous).toMatchObject({ from: '2026-10-03', to: '2026-10-03', completed: 1, rate: 25 })
    expect(result.rateDelta).toBe(25)
  })

  it('uses the full weeks when today is Friday', () => {
    const tasks = [...tasksOn('2026-10-16', 1, 1), ...tasksOn('2026-10-09', 2, 0)]
    const result = compareWeeksToDate(tasks, '2026-10-16')
    expect(result.current).toMatchObject({ from: '2026-10-10', to: '2026-10-16', completed: 1, total: 1 })
    expect(result.previous).toMatchObject({ from: '2026-10-03', to: '2026-10-09', completed: 0, total: 2, rate: 0 })
    expect(result).toMatchObject({ completedDelta: 1, rateDelta: 100 })
  })

  it('has no rate delta when last week has no tasks', () => {
    const result = compareWeeksToDate(tasksOn('2026-10-12', 2, 2), '2026-10-14')
    expect(result.previous).toMatchObject({ total: 0, completed: 0, rate: null })
    expect(result).toMatchObject({ completedDelta: 2, rateDelta: null })
  })

  it('has no rate delta when this week has no tasks yet', () => {
    const result = compareWeeksToDate(tasksOn('2026-10-04', 2, 1), '2026-10-14')
    expect(result).toMatchObject({ completedDelta: -1, rateDelta: null })
  })

  it('subtracts the displayed (rounded) rates', () => {
    // 2/3 shows 67%, 1/3 shows 33%: the delta is 34 points, as the user can check.
    const tasks = [...tasksOn('2026-10-12', 3, 2), ...tasksOn('2026-10-05', 3, 1)]
    expect(compareWeeksToDate(tasks, '2026-10-14').rateDelta).toBe(34)
  })
})

describe('getWeeklyHistory', () => {
  it('returns 8 full weeks, oldest first, including empty weeks', () => {
    const tasks = [...tasksOn('2026-10-15', 2, 1), ...tasksOn('2026-09-01', 3, 3), ...tasksOn('2026-08-20', 5, 5)]
    const history = getWeeklyHistory(tasks, '2026-10-14')
    expect(history).toHaveLength(8)
    expect(history[0].weekStart).toBe('2026-08-22')
    expect(history[7].weekStart).toBe('2026-10-10')
    // The current week is a full week, so tomorrow's tasks count here (charts only, BR-04).
    expect(history[7]).toMatchObject({ total: 2, completed: 1, rate: 50 })
    // 2026-09-01 is a Tuesday in the week of Saturday 2026-08-29.
    expect(history[1]).toMatchObject({ weekStart: '2026-08-29', completed: 3 })
    expect(history.filter((week) => week.rate === null)).toHaveLength(6)
    // 2026-08-20 is before the 8 weeks.
    expect(history.reduce((sum, week) => sum + week.total, 0)).toBe(5)
  })

  it('accepts another number of weeks', () => {
    expect(getWeeklyHistory([], '2026-10-14', 2).map((week) => week.weekStart)).toEqual(['2026-10-03', '2026-10-10'])
  })
})

describe('summarizeHistory', () => {
  const week = (weekStart, completed) => ({ weekStart, completed })

  it('adds up the completed tasks and finds the strongest week', () => {
    expect(summarizeHistory([week('2026-09-26', 4), week('2026-10-03', 6), week('2026-10-10', 2)])).toEqual({
      totalCompleted: 12,
      strongest: { weekStart: '2026-10-03', completed: 6 },
    })
  })

  it('gives a tie to the most recent week (as BR-05)', () => {
    expect(summarizeHistory([week('2026-09-26', 5), week('2026-10-03', 5), week('2026-10-10', 1)]).strongest).toEqual({
      weekStart: '2026-10-03',
      completed: 5,
    })
  })

  it('has no strongest week when nothing was completed', () => {
    expect(summarizeHistory([week('2026-10-03', 0), week('2026-10-10', 0)])).toEqual({ totalCompleted: 0, strongest: null })
    expect(summarizeHistory([])).toEqual({ totalCompleted: 0, strongest: null })
  })
})
