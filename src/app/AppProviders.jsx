import { BrowserRouter } from 'react-router'
import { ToastProvider } from '@/components/ui/ToastProvider.jsx'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

/** App-wide providers. AuthProvider (Phase 5) and TasksProvider (Phase 3) are added here. */
export function AppProviders({ children }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>{children}</ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nProvider>
  )
}
