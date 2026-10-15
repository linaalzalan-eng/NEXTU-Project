import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToday } from './useToday.js'

// BR-10 (the full day-rollover journey is IT-06 in Phase 4)
describe('useToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 14, 23, 59, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the local date', () => {
    const { result } = renderHook(() => useToday())
    expect(result.current).toBe('2026-10-14')
  })

  it('moves to the next day at local midnight', () => {
    const { result } = renderHook(() => useToday())

    act(() => vi.advanceTimersByTime(2 * 60 * 1000))

    expect(result.current).toBe('2026-10-15')
  })

  it('catches up when the window regains focus', () => {
    const { result } = renderHook(() => useToday())

    // The clock jumps (for example, the laptop slept) without the timer firing.
    vi.setSystemTime(new Date(2026, 9, 16, 8, 0, 0))
    act(() => window.dispatchEvent(new Event('focus')))

    expect(result.current).toBe('2026-10-16')
  })

  it('catches up when the page becomes visible', () => {
    const { result } = renderHook(() => useToday())

    vi.setSystemTime(new Date(2026, 9, 16, 8, 0, 0))
    act(() => document.dispatchEvent(new Event('visibilitychange')))

    expect(result.current).toBe('2026-10-16')
  })
})
