import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { useToast } from '@/components/ui/useToast.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { validateNewPasswordInput } from '../lib/authValidation.js'
import { useAuth } from '../useAuth.js'
import { useAuthForm } from '../useAuthForm.js'

/**
 * New password (US-26, FR-09), shown only during a recovery session. After saving,
 * the session becomes a normal one and the page moves on to /dashboard.
 * UNAUTHENTICATED means the recovery session has ended, which the page shows as an
 * expired link (`onExpired`). VALIDATION here means Supabase refused the password
 * itself, for example because it is the current one.
 */
export function ResetPasswordForm({ onExpired }) {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { updatePassword } = useAuth()
  const form = useAuthForm({
    initialValues: { password: '', confirmPassword: '' },
    validate: validateNewPasswordInput,
    onSubmit: async ({ password }) => {
      try {
        await updatePassword({ password })
      } catch (caught) {
        if (caught.code === 'UNAUTHENTICATED') return onExpired()
        throw caught
      }
      showToast({ variant: 'success', message: t('auth.reset.done') })
    },
  })
  const messageKey =
    form.formError?.code === 'VALIDATION' ? 'auth.reset.rejected' : form.formError && errorMessageKey(form.formError)

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
      {messageKey && <Alert variant="danger">{t(messageKey)}</Alert>}
      <Input
        label={t('auth.reset.newPassword')}
        hint={t('auth.register.passwordHint')}
        type="password"
        autoComplete="new-password"
        dir="ltr"
        {...form.field('password')}
      />
      <Input
        label={t('auth.reset.confirmPassword')}
        type="password"
        autoComplete="new-password"
        dir="ltr"
        {...form.field('confirmPassword')}
      />
      <Button type="submit" loading={form.submitting} className="mt-2 w-full">
        {t('auth.reset.submit')}
      </Button>
    </form>
  )
}
