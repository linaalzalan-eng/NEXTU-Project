import { describe, expect, it } from 'vitest'
import { directionProps } from './chartTheme.js'

describe('directionProps', () => {
  it('keeps the default axes in LTR', () => {
    expect(directionProps('ltr')).toEqual({ xAxis: { reversed: false }, yAxis: { orientation: 'left' } })
  })

  it('mirrors the chart in RTL: time runs right to left, values on the right', () => {
    expect(directionProps('rtl')).toEqual({ xAxis: { reversed: true }, yAxis: { orientation: 'right' } })
  })
})
