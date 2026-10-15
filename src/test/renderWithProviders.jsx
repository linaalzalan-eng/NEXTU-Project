import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ToastProvider } from '@/components/ui/ToastProvider.jsx'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { setupUser } from './setupUser.js'

/**
 * Renders a component with the app-wide UI providers (language, router, toasts).
 * Tests use English by default so assertions read naturally; pass lang: 'ar' for RTL.
 * Returns RTL's render result plus a userEvent instance as `user`.
 */
export function renderWithProviders(ui, { lang = 'en', route = '/' } = {}) {
  localStorage.setItem('mind.lang', lang)
  const user = setupUser()
  const result = render(
    <I18nProvider>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{ui}</ToastProvider>
      </MemoryRouter>
    </I18nProvider>,
  )
  return { user, ...result }
}
