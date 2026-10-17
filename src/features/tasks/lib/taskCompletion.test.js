import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories.js'
import { applyCompletion } from './taskCompletion.js'

const NOW = '2026-10-14T09:00:00.000Z'

// UT-03 (BR-12)
describe('applyCompletion', () => {
  it('completing sets the status and completedAt together', () => {
    const task = makeTask()
    expect(applyCompletion(task, true, NOW)).toEqual({ ...task, status: 'completed', completedAt: NOW })
  })

  it('marking pending clears completedAt', () => {
    const task = makeTask({ status: 'completed' })
    expect(applyCompletion(task, false, NOW)).toEqual({ ...task, status: 'pending', completedAt: null })
  })

  it('does not change its input', () => {
    const task = makeTask()
    applyCompletion(task, true, NOW)
    expect(task).toMatchObject({ status: 'pending', completedAt: null })
  })
})
