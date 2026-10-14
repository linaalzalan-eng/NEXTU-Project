import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { usePreviewSubmit } from './preview/usePreviewSubmit.js'

/**
 * Layout only in Phase 2. Phase 5 adds the recovery-session check (isRecovery),
 * VR-02/VR-05 validation, and updatePassword (US-26, D-19).
 */
export default function ResetPasswordPage() {
  const { t } = useI18n()
  const handleSubmit = usePreviewSubmit()

  return (
    <>
      <AuthHeader title={t('auth.reset.title')} lede={t('auth.reset.lede')} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label={t('auth.reset.newPassword')}
          hint={t('auth.register.passwordHint')}
          name="password"
          type="password"
          autoComplete="new-password"
          dir="ltr"
        />
        <Input
          label={t('auth.reset.confirmPassword')}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          dir="ltr"
        />
        <Button type="submit" className="mt-2 w-full">
          {t('auth.reset.submit')}
        </Button>
      </form>
    </>
  )
}
