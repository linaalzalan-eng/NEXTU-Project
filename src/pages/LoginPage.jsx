import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { LoginForm } from '@/features/auth/components/LoginForm.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** /login (US-02). Public-only: a signed-in user is redirected by PublicOnlyRoute. */
export default function LoginPage() {
  const { t } = useI18n()

  return (
    <>
      <AuthHeader title={t('auth.login.title')} lede={t('auth.login.lede')} />
      <LoginForm />
      <p className="mt-7 border-t border-line pt-6 text-center text-sm text-ink-2">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className={textLink()}>
          {t('auth.login.create')}
        </Link>
      </p>
    </>
  )
}
