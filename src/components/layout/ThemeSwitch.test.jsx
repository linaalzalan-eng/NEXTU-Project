import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { ThemeProvider } from '@/lib/theme/ThemeProvider.jsx'
import { setupUser } from '@/test/setupUser.js'
import { ThemeSwitch } from './ThemeSwitch.jsx'

describe('two-theme toggle', () => {
  it.each([['en', 'Dark', 'Light'], ['ar', 'داكن', 'فاتح']])('toggles and persists both themes with the keyboard in %s', async (lang, dark, light) => {
    localStorage.setItem('mind.lang', lang)
    localStorage.setItem('nextu.theme', 'light')
    const user = setupUser()
    render(<I18nProvider><ThemeProvider><ThemeSwitch compact /></ThemeProvider></I18nProvider>)
    const toggle = screen.getByRole('button', { name: new RegExp(dark) })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(toggle).not.toHaveAttribute('aria-haspopup')
    toggle.focus()
    await user.keyboard(' ')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('nextu.theme')).toBe('dark')
    expect(screen.getByRole('button', { name: new RegExp(light) })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('nextu.theme')).toBe('light')
  })
})
