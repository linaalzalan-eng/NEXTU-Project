import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import { StatusFilter } from './StatusFilter.jsx'

// CT-05, part 2 (FR-13, US-15)
describe('StatusFilter', () => {
  it('exposes the active filter with aria-pressed', () => {
    renderWithProviders(<StatusFilter value="pending" onChange={vi.fn()} />)

    expect(screen.getByRole('group', { name: 'Show tasks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Pending' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the chosen filter', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(<StatusFilter value="all" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Completed' }))

    expect(onChange).toHaveBeenCalledWith('completed')
  })
})
