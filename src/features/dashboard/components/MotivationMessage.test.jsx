import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { setupUser } from '@/test/setupUser.js'
import { MotivationMessage } from './MotivationMessage.jsx'

describe('NextU Buddy', () => {
  it.each([[0, 0, '🌱'], [0, 4, '🌱'], [1, 4, '😊'], [2, 4, '💪'], [4, 4, '🎉'], [199, 200, '💪'], [99, 200, '💪']])('uses actual progress %s/%s for %s', (completed, total, emoji) => {
    localStorage.setItem('mind.lang', 'en')
    render(<I18nProvider><MotivationMessage completed={completed} total={total} message="Keep going" /></I18nProvider>)
    expect(screen.getByRole('button', { name: /Buddy/ })).toHaveTextContent(emoji)
    expect(screen.getByText('Keep going')).toHaveAttribute('aria-live', 'polite')
  })
  it('can be greeted with the keyboard without changing progress or the message', async () => {
    localStorage.setItem('mind.lang', 'ar')
    const user = setupUser()
    render(<I18nProvider><MotivationMessage completed={1} total={4} message="بداية جيدة" /></I18nProvider>)
    const buddy = screen.getByRole('button')
    buddy.focus()
    await user.keyboard('{Enter}')
    expect(buddy).toHaveTextContent('😊')
    expect(buddy).toHaveFocus()
    expect(screen.getByText('بداية جيدة')).toBeInTheDocument()
  })
})
