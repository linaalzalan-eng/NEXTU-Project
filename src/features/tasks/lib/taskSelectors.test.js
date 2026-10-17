import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import {
  byDateThenCreation,
  filterByStatus,
  isTaskLocked,
  selectOverdue,
  selectTasksForDate,
  sortTasks,
} from './taskSelectors.js'

const TODAY = '2026-10-14'
const titles = (tasks) => tasks.map((task) => task.title)

// UT-03 (FR-11, FR-13, BR-09, PRD F2)
describe('taskSelectors', () => {
  const tasks = [
    makeTask({ title: 'today pending', taskDate: TODAY }),
    makeTask({ title: 'today done', taskDate: TODAY, status: 'completed' }),
    makeTask({ title: 'yesterday pending', taskDate: '2026-10-13' }),
    makeTask({ title: 'yesterday done', taskDate: '2026-10-13', status: 'completed' }),
    makeTask({ title: 'last month pending', taskDate: '2026-09-20' }),
    makeTask({ title: 'tomorrow pending', taskDate: '2026-10-15' }),
  ]

  it('selectTasksForDate keeps only that day', () => {
    expect(titles(selectTasksForDate(tasks, TODAY))).toEqual(['today pending', 'today done'])
    expect(selectTasksForDate(tasks, '2026-01-01')).toEqual([])
  })

  it.each([
    ['all', ['today pending', 'today done']],
    ['pending', ['today pending']],
    ['completed', ['today done']],
  ])('filterByStatus "%s"', (status, expected) => {
    expect(titles(filterByStatus(selectTasksForDate(tasks, TODAY), status))).toEqual(expected)
  })

  describe('selectOverdue (BR-09)', () => {
    it('lists pending tasks before today, oldest first', () => {
      expect(titles(selectOverdue(tasks, TODAY))).toEqual(['last month pending', 'yesterday pending'])
    })

    it('never includes today, the future, or completed tasks', () => {
      const overdue = selectOverdue(tasks, TODAY)
      expect(overdue.every((task) => task.status === 'pending' && task.taskDate < TODAY)).toBe(true)
    })

    it('follows the new day when today changes', () => {
      expect(titles(selectOverdue(tasks, '2026-10-15'))).toEqual([
        'last month pending',
        'yesterday pending',
        'today pending',
      ])
    })
  })

  describe('sortTasks (PRD F2)', () => {
    it('puts pending first, then completed, each by creation time', () => {
      const day = [
        makeTask({ title: 'done 1', status: 'completed', createdAt: '2026-10-14T08:00:00.000Z' }),
        makeTask({ title: 'open 2', createdAt: '2026-10-14T09:00:00.000Z' }),
        makeTask({ title: 'done 2', status: 'completed', createdAt: '2026-10-14T10:00:00.000Z' }),
        makeTask({ title: 'open 1', createdAt: '2026-10-14T07:00:00.000Z' }),
      ]
      expect(titles(sortTasks(day))).toEqual(['open 1', 'open 2', 'done 1', 'done 2'])
    })

    it('does not change the input array', () => {
      const day = [makeTask({ status: 'completed' }), makeTask()]
      const copy = [...day]
      sortTasks(day)
      expect(day).toEqual(copy)
    })
  })

  it('byDateThenCreation breaks a createdAt tie by id (API_CONTRACTS §4)', () => {
    const createdAt = '2026-10-14T08:00:00.000Z'
    const b = makeTask({ id: 'b', taskDate: TODAY, createdAt })
    const a = makeTask({ id: 'a', taskDate: TODAY, createdAt })
    const earlierDay = makeTask({ id: 'z', taskDate: '2026-10-13', createdAt })
    expect([b, a, earlierDay].sort(byDateThenCreation).map((task) => task.id)).toEqual(['z', 'a', 'b'])
  })

  describe('isTaskLocked', () => {
    it('locks an unsaved task and a task with a request in flight', () => {
      const saved = makeTask()
      expect(isTaskLocked(makeTask({ id: 'temp-1' }), new Set())).toBe(true)
      expect(isTaskLocked(saved, new Set([saved.id]))).toBe(true)
    })

    it('leaves a saved, idle task unlocked, also without busyIds', () => {
      expect(isTaskLocked(makeTask(), new Set())).toBe(false)
      expect(isTaskLocked(makeTask(), undefined)).toBe(false)
    })
  })
})
