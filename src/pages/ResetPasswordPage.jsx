import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { PageLoader } from '@/components/layout/PageLoader.jsx'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm.jsx'
import { useAuth } from '@/features/auth/useAuth.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * /reset-password (US-26, D-19, ARCHITECTURE §9). Neither public-only nor protected:
 * - a recovery session from the email link → the new-password form;
 * - a normal session → /dashboard, so an unattended signed-in browser cannot be used
 *   to change the password without the email link (also where a saved password leads);
 * - no session, or a recovery session that has ended → "link invalid or expired".
 */
export default function ResetPasswordPage() {
  const { t } = useI18n()
  const { status, isRecovery } = useAuth()
  const [expired, setExpired] = useState(false)

  if (status === 'loading') return <PageLoader />

  if (isRecovery && !expired) {
    return (
      <>
        <AuthHeader title={t('auth.reset.title')} lede={t('auth.reset.lede')} />
        <ResetPasswordForm onExpired={() => setExpired(true)} />
      </>
    )
  }

  if (status === 'authenticated' && !expired) return <Navigate to="/dashboard" replace />

  return (
    <>
      <AuthHeader title={t('auth.reset.invalidTitle')} lede={t('auth.reset.invalidBody')} />
      <Link to="/forgot-password" className={buttonStyles({ className: 'h-12 w-full' })}>
        {t('auth.reset.invalidAction')}
      </Link>
    </>
  )
}
