import { BrowserRouter } from 'react-router'
import { ToastProvider } from '@/components/ui/ToastProvider.jsx'
import { TasksProvider } from '@/features/tasks/TasksProvider.jsx'
import { I18nProvider } from '@/lib/i18n/I18nProvider.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

/** App-wide providers. AuthProvider is added here in Phase 5, above TasksProvider. */
export function AppProviders({ children }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <TasksProvider>{children}</TasksProvider>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nProvider>
  )
}
