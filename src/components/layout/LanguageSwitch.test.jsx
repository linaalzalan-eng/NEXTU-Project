import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { setupUser } from '@/test/setupUser.js'
import { LanguageSwitch } from './LanguageSwitch.jsx'

// CT-09 (US-23, FR-40, NFR-46)
describe('LanguageSwitch', () => {
  afterEach(() => {
    document.documentElement.lang = ''
    document.documentElement.dir = ''
  })

  it('starts in Arabic and offers English', () => {
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)

    expect(document.documentElement).toHaveAttribute('lang', 'ar')
    expect(document.documentElement).toHaveAttribute('dir', 'rtl')
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
  })

  it('switches lang and dir on <html> and remembers the choice', async () => {
    const user = setupUser()
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)

    await user.click(screen.getByRole('button', { name: 'English' }))

    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    expect(localStorage.getItem('mind.lang')).toBe('en')
    expect(screen.getByRole('button', { name: 'العربية' })).toBeInTheDocument()
  })

  it('restores the saved language on the next visit', () => {
    localStorage.setItem('mind.lang', 'en')
    render(<I18nProvider><LanguageSwitch /></I18nProvider>)

    expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  })
})
