import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressBar } from './ProgressBar.jsx'

// CT-06 (NFR-44, BR-06)
describe('ProgressBar', () => {
  it('exposes its value to assistive technology', () => {
    render(<ProgressBar value={67} label="Today’s progress" emptyText="No tasks yet" />)
    const bar = screen.getByRole('progressbar', { name: 'Today’s progress' })
    expect(bar).toHaveAttribute('aria-valuenow', '67')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuetext', '67%')
  })

  it('has no value and says why when there are no tasks', () => {
    render(<ProgressBar value={null} label="Today’s progress" emptyText="No tasks yet" />)
    const bar = screen.getByRole('progressbar', { name: 'Today’s progress' })
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).toHaveAttribute('aria-valuetext', 'No tasks yet')
    expect(bar).toBeEmptyDOMElement()
  })

  it('shows 0% as a real value, not as "no tasks"', () => {
    render(<ProgressBar value={0} label="Today’s progress" emptyText="No tasks yet" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })
})
