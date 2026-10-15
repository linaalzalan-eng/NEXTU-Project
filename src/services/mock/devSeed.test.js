import { describe, expect, it } from 'vitest'
import { validateTaskInput } from '@/features/tasks/lib/taskValidation.js'
import { addDays, startOfWeek } from '@/lib/dates.js'
import { buildSeedTasks } from './devSeed.js'

const TODAY = '2026-10-14'
const NOW = new Date('2026-10-14T09:00:00.000Z')

// P4-T01: the development seed must be valid data, or the analytics review is meaningless.
describe('buildSeedTasks', () => {
  const tasks = buildSeedTasks({ today: TODAY, now: NOW })

  it('covers about 10 weeks, plus a few days ahead', () => {
    const dates = tasks.map((task) => task.taskDate).sort()
    expect(dates[0] >= addDays(startOfWeek(TODAY), -63)).toBe(true)
    expect(dates.at(-1) <= addDays(TODAY, 3)).toBe(true)
    expect(new Set(dates).size).toBeGreaterThan(40)
    expect(tasks.some((task) => task.taskDate === TODAY)).toBe(true)
  })

  it('creates only valid tasks (VR-03, VR-04, BR-12, BR-14)', () => {
    const ids = new Set()
    for (const task of tasks) {
      expect(validateTaskInput(task, TODAY)).toEqual({})
      expect(task.completedAt !== null).toBe(task.status === 'completed')
      expect(task.taskDate > TODAY && task.status === 'completed').toBe(false)
      expect(Date.parse(task.createdAt)).toBeLessThanOrEqual(NOW.getTime())
      ids.add(task.id)
    }
    expect(ids.size).toBe(tasks.length)
  })

  it('includes completed, open, and overdue tasks', () => {
    expect(tasks.filter((task) => task.status === 'completed').length).toBeGreaterThan(50)
    const overdue = tasks.filter((task) => task.status === 'pending' && task.taskDate < TODAY)
    expect(overdue.length).toBeGreaterThan(0)
    expect(overdue.length).toBeLessThan(tasks.length / 4)
  })

  it('is the same every time for the same seed', () => {
    expect(buildSeedTasks({ today: TODAY, now: NOW })).toEqual(tasks)
    expect(buildSeedTasks({ today: TODAY, now: NOW, seed: 8 })).not.toEqual(tasks)
  })

  it('creates exactly `count` tasks for the performance check', () => {
    expect(buildSeedTasks({ today: TODAY, now: NOW, count: 5000 })).toHaveLength(5000)
  })
})
