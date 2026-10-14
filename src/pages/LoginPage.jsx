import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { usePreviewSubmit } from './preview/usePreviewSubmit.js'

/** Layout only in Phase 2; validation and sign-in arrive in Phase 5 (US-02). */
export default function LoginPage() {
  const { t } = useI18n()
  const handleSubmit = usePreviewSubmit()

  return (
    <>
      <AuthHeader title={t('auth.login.title')} lede={t('auth.login.lede')} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input label={t('auth.email')} name="email" type="email" autoComplete="email" dir="ltr" />
        <div>
          <Input label={t('auth.password')} name="password" type="password" autoComplete="current-password" dir="ltr" />
          <Link to="/forgot-password" className={textLink({ className: 'mt-2 inline-block text-sm' })}>
            {t('auth.login.forgot')}
          </Link>
        </div>
        <Button type="submit" className="mt-2 w-full">
          {t('auth.login.submit')}
        </Button>
      </form>
      <p className="mt-8 text-sm text-ink-2">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className={textLink()}>
          {t('auth.login.create')}
        </Link>
      </p>
    </>
  )
}
