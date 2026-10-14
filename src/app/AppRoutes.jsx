import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout.jsx'
import { AuthLayout } from '@/components/layout/AuthLayout.jsx'
import DashboardPage from '@/pages/DashboardPage.jsx'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx'
import LoginPage from '@/pages/LoginPage.jsx'
import NotFoundPage from '@/pages/NotFoundPage.jsx'
import RegisterPage from '@/pages/RegisterPage.jsx'
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx'
import TasksPage from '@/pages/TasksPage.jsx'

// Analytics is lazy-loaded so its code (and Recharts, from Phase 4) stays out of the first bundle (NFR-03).
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage.jsx'))
// Development-only component gallery; never included in the production build (D-22).
const UiGalleryPage = import.meta.env.DEV ? lazy(() => import('@/pages/UiGalleryPage.jsx')) : null

/**
 * Route table (ARCHITECTURE §9). Protected and public-only wrappers are added in Phase 5.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        {UiGalleryPage && <Route path="ui" element={<UiGalleryPage />} />}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
    </Routes>
  )
}
