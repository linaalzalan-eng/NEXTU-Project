import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { DateNavigator } from './DateNavigator.jsx'

const TODAY = '2026-10-14'

function setup(date = TODAY, options) {
  const onChange = vi.fn()
  const view = renderWithProviders(<DateNavigator date={date} today={TODAY} onChange={onChange} />, options)
  return { onChange, ...view }
}

// CT-05, part 1 (FR-12, US-13, US-14)
describe('DateNavigator', () => {
  it('moves one day back and forward', async () => {
    const { user, onChange } = setup()

    await user.click(screen.getByRole('button', { name: 'Previous day' }))
    await user.click(screen.getByRole('button', { name: 'Next day' }))

    expect(onChange.mock.calls).toEqual([['2026-10-13'], ['2026-10-15']])
  })

  it('jumps to a picked date', () => {
    const { onChange } = setup()
    const picker = screen.getByLabelText('Pick a date')

    // Choosing a day in the browser's picker fires one change with the full date.
    fireEvent.change(picker, { target: { value: '2026-11-02' } })
    expect(onChange).toHaveBeenLastCalledWith('2026-11-02')

    // A cleared or half-typed date is ignored, and so is one outside BR-14.
    fireEvent.change(picker, { target: { value: '' } })
    fireEvent.change(picker, { target: { value: '2099-01-01' } })
    fireEvent.change(picker, { target: { value: '1999-12-31' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('offers Today when another day is shown, and disables it on today', async () => {
    const { user, onChange, unmount } = setup('2026-10-01')
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(onChange).toHaveBeenCalledWith(TODAY)
    unmount()

    setup(TODAY)
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled()
  })

  it('stops at the allowed range (BR-14)', () => {
    setup('2027-10-14')
    expect(screen.getByRole('button', { name: 'Next day' })).toBeDisabled()
    expect(screen.getByLabelText('Pick a date')).toHaveAttribute('max', '2027-10-14')
  })

  it('mirrors the chevrons in RTL and uses Arabic labels', () => {
    setup(TODAY, { lang: 'ar' })

    for (const name of ['اليوم السابق', 'اليوم التالي']) {
      const icon = screen.getByRole('button', { name }).querySelector('svg')
      expect(icon).toHaveClass('rtl:-scale-x-100')
    }
  })
})
