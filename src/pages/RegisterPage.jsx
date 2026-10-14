import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { usePreviewSubmit } from './preview/usePreviewSubmit.js'

/** Layout only in Phase 2; validation (VR-01, VR-02) and sign-up arrive in Phase 5 (US-01). */
export default function RegisterPage() {
  const { t } = useI18n()
  const handleSubmit = usePreviewSubmit()

  return (
    <>
      <AuthHeader title={t('auth.register.title')} lede={t('auth.register.lede')} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input label={t('auth.email')} name="email" type="email" autoComplete="email" dir="ltr" />
        <Input
          label={t('auth.password')}
          hint={t('auth.register.passwordHint')}
          name="password"
          type="password"
          autoComplete="new-password"
          dir="ltr"
        />
        <Button type="submit" className="mt-2 w-full">
          {t('auth.register.submit')}
        </Button>
      </form>
      <p className="mt-8 text-sm text-ink-2">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className={textLink()}>
          {t('auth.register.login')}
        </Link>
      </p>
    </>
  )
}
