import { BrowserRouter } from 'react-router'
import { ToastProvider } from '@/components/ui/ToastProvider.jsx'
import { AuthProvider } from '@/features/auth/AuthProvider.jsx'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

/**
 * App-wide providers. The task list is not here: it lives inside ProtectedRoute,
 * one per signed-in user (D-30).
 */
export function AppProviders({ children }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nProvider>
  )
}
