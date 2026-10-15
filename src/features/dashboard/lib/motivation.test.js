import { describe, expect, it } from 'vitest'
import { getMotivationKey } from './motivation.js'

// UT-04 (BR-13): every band at its boundaries, decided from the counts
describe('getMotivationKey', () => {
  it.each([
    [0, 0, 'motivation.noTasks'],
    [0, 3, 'motivation.zero'],
    [1, 100, 'motivation.started'], // 1%
    [1, 201, 'motivation.started'], // shows 1%, not "zero"
    [49, 100, 'motivation.started'], // 49%
    [50, 100, 'motivation.close'], // 50%
    [1, 2, 'motivation.close'],
    [99, 100, 'motivation.close'], // 99%
    [199, 200, 'motivation.close'], // shows 99%, not "done"
    [3, 3, 'motivation.done'],
  ])('%i of %i → %s', (completed, total, key) => {
    expect(getMotivationKey({ completed, total })).toBe(key)
  })

  it('follows the displayed rate at the 49/50 boundary', () => {
    // 99/200 = 49.5%, displayed as 50%, so the message must not say "just started".
    expect(getMotivationKey({ completed: 99, total: 200 })).toBe('motivation.close')
    expect(getMotivationKey({ completed: 97, total: 200 })).toBe('motivation.started') // 48.5% → 49%
  })
})
