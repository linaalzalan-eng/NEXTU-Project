import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { getPersonalBest } from './personalBest.js'

const TODAY = '2026-10-14' // Wednesday; this week starts Saturday 2026-10-10

function done(taskDate, n = 1) {
  return Array.from({ length: n }, () => makeTask({ taskDate, status: 'completed' }))
}

// UT-06 (BR-05, BR-07)
describe('getPersonalBest', () => {
  it('is empty until a task has been completed', () => {
    expect(getPersonalBest([], TODAY)).toEqual({ bestDay: null, bestWeek: null, isTodayBest: false, isThisWeekBest: false })
    expect(getPersonalBest([makeTask({ taskDate: TODAY })], TODAY).bestDay).toBeNull()
  })

  it('finds the best day and best week by completed count', () => {
    const tasks = [
      ...done('2026-09-29', 2), // week of 09-26: 2 + 3 = 5
      ...done('2026-10-01', 3),
      ...done('2026-10-05', 4), // week of 10-03: 4, the best single day
      ...done('2026-10-12', 1), // this week: 1
      makeTask({ taskDate: '2026-10-06' }), // pending tasks never count
    ]
    expect(getPersonalBest(tasks, TODAY)).toEqual({
      bestDay: { date: '2026-10-05', completed: 4 },
      bestWeek: { weekStart: '2026-09-26', completed: 5 },
      isTodayBest: false,
      isThisWeekBest: false,
    })
  })

  it('gives a tie to the most recent day and week', () => {
    const tasks = [...done('2026-09-30', 3), ...done('2026-10-07', 3)]
    const result = getPersonalBest(tasks, TODAY)
    expect(result.bestDay).toEqual({ date: '2026-10-07', completed: 3 })
    expect(result.bestWeek).toEqual({ weekStart: '2026-10-03', completed: 3 })
  })

  it('marks today and this week when they match or beat the record', () => {
    const tasks = [...done('2026-10-07', 2), ...done(TODAY, 2)]
    expect(getPersonalBest(tasks, TODAY)).toMatchObject({ isTodayBest: true, isThisWeekBest: true })
  })

  it('can mark this week without today', () => {
    const tasks = [...done('2026-10-11', 3), ...done(TODAY, 1), ...done('2026-10-03', 2)]
    expect(getPersonalBest(tasks, TODAY)).toMatchObject({ isTodayBest: false, isThisWeekBest: true })
  })

  it('ignores completed tasks dated in the future', () => {
    const tasks = [...done('2026-10-12', 1), ...done('2026-10-15', 5), ...done('2026-10-20', 9)]
    expect(getPersonalBest(tasks, TODAY)).toMatchObject({
      bestDay: { date: '2026-10-12', completed: 1 },
      bestWeek: { weekStart: '2026-10-10', completed: 1 },
    })
  })

  it('drops when the record task is deleted (BR-07: the input no longer has it)', () => {
    const record = done('2026-10-05', 3)
    const tasks = [...record, ...done('2026-10-06', 2)]
    expect(getPersonalBest(tasks, TODAY).bestDay.completed).toBe(3)
    const afterDelete = tasks.filter((task) => task.id !== record[0].id)
    expect(getPersonalBest(afterDelete, TODAY).bestDay).toEqual({ date: '2026-10-06', completed: 2 })
  })
})
