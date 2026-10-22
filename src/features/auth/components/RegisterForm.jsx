import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { normalizeEmail, validateRegisterInput } from '../lib/authValidation.js'
import { useAuth } from '../useAuth.js'
import { useAuthForm } from '../useAuthForm.js'

/**
 * Register (US-01, FR-01). With "Confirm email" on there is no session yet, so the
 * page shows "check your email" through `onConfirmationSent(email)` (D-18). With it
 * off, the new account is signed in and PublicOnlyRoute moves on to /dashboard.
 */
export function RegisterForm({ onConfirmationSent }) {
  const { t } = useI18n()
  const { signUp } = useAuth()
  const form = useAuthForm({
    initialValues: { email: '', password: '' },
    validate: validateRegisterInput,
    onSubmit: async (values) => {
      const { session } = await signUp(values)
      if (!session) onConfirmationSent(normalizeEmail(values.email))
    },
  })

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
      {form.formError && <Alert variant="danger">{t(errorMessageKey(form.formError))}</Alert>}
      <Input label={t('auth.email')} type="email" autoComplete="email" dir="ltr" {...form.field('email')} />
      <Input
        label={t('auth.password')}
        hint={t('auth.register.passwordHint')}
        type="password"
        autoComplete="new-password"
        dir="ltr"
        {...form.field('password')}
      />
      <Button type="submit" loading={form.submitting} className="mt-2 w-full">
        {t('auth.register.submit')}
      </Button>
    </form>
  )
}
