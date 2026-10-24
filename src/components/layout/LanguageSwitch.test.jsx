import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { setupUser } from '@/test/setupUser.js'
import { LanguageSwitch } from './LanguageSwitch.jsx'

afterEach(() => { document.documentElement.lang = ''; document.documentElement.dir = '' })

describe('segmented language toggle', () => {
  it('shows both choices and marks the active Arabic language', () => {
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)
    expect(screen.getByRole('group', { name: 'اللغة' })).toHaveAttribute('dir', 'ltr')
    expect(screen.getByRole('button', { name: 'عربي' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  })
  it('switches both ways, preserves focus, updates direction and saves the choice', async () => {
    const user = setupUser()
    render(<I18nProvider><LanguageSwitch compact /></I18nProvider>)
    const english = screen.getByRole('button', { name: 'EN' })
    await user.click(english)
    expect(english).toHaveFocus()
    expect(english).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(localStorage.getItem('mind.lang')).toBe('en')
    const arabic = screen.getByRole('button', { name: 'عربي' })
    arabic.focus()
    await user.keyboard('{Enter}')
    expect(arabic).toHaveFocus()
    expect(arabic).toHaveAttribute('aria-pressed', 'true')
    expect(english).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem('mind.lang')).toBe('ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  })
  it('restores English and keeps pressing the active choice stable', async () => {
    localStorage.setItem('mind.lang', 'en')
    const user = setupUser()
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    const english = screen.getByRole('button', { name: 'EN' })
    expect(english).toHaveAttribute('aria-pressed', 'true')
    await user.click(english)
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(localStorage.getItem('mind.lang')).toBe('en')
  })
})
