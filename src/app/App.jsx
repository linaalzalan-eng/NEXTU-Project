import { ScrollToTop } from '@/components/layout/ScrollToTop.jsx'
import { AppProviders } from './AppProviders.jsx'
import { AppRoutes } from './AppRoutes.jsx'

export default function App() {
  return (
    <AppProviders>
      <ScrollToTop />
      <AppRoutes />
    </AppProviders>
  )
}
