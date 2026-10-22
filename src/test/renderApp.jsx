import { render } from '@testing-library/react'
import App from '@/app/App.jsx'
import { SIGNED_OUT_STORAGE_KEY } from '@/services/mock/mockAuthService.js'
import { setupUser } from './setupUser.js'

/**
 * Renders the whole app at `path`, in English, with the mock services, as a user
 * would open it. The mock's demo user is signed in unless `signedIn: false`.
 * Returns RTL's render result plus a userEvent instance as `user`.
 */
export function renderApp(path, { signedIn = true, lang = 'en' } = {}) {
  localStorage.setItem('mind.lang', lang)
  if (!signedIn) localStorage.setItem(SIGNED_OUT_STORAGE_KEY, 'true')
  window.history.pushState({}, '', path)
  const user = setupUser()
  return { user, ...render(<App />) }
}
