import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { normalizeEmail, validateResetRequestInput } from '../lib/authValidation.js'
import { useAuth } from '../useAuth.js'
import { useAuthForm } from '../useAuthForm.js'

/**
 * Forgot password (US-26, FR-08). Any accepted request leads to the same
 * "if an account exists" screen through `onSent(email)`, so nobody can use this
 * form to find out which emails are registered (D-19).
 *
 * That includes RATE_LIMITED: Supabase limits repeated emails only to addresses that
 * have an account, so "too many attempts" would reveal one. It is shown as sent (D-30).
 */
export function ForgotPasswordForm({ onSent }) {
  const { t } = useI18n()
  const { requestPasswordReset } = useAuth()
  const form = useAuthForm({
    initialValues: { email: '' },
    validate: validateResetRequestInput,
    onSubmit: async (values) => {
      try {
        await requestPasswordReset(values)
      } catch (caught) {
        if (caught.code !== 'RATE_LIMITED') throw caught
      }
      onSent(normalizeEmail(values.email))
    },
  })
  const canRetry = form.formError?.code === 'NETWORK' || form.formError?.code === 'UNKNOWN'

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
      {form.formError && (
        <Alert
          variant="danger"
          action={
            canRetry && (
              // A submit button inside the form: it sends the same email again.
              <Button type="submit" variant="secondary" size="sm" loading={form.submitting}>
                {t('common.retry')}
              </Button>
            )
          }
        >
          {t(errorMessageKey(form.formError))}
        </Alert>
      )}
      <Input label={t('auth.email')} type="email" autoComplete="email" dir="ltr" {...form.field('email')} />
      <Button type="submit" loading={form.submitting} className="mt-1 h-12 w-full">
        {t('auth.forgot.submit')}
      </Button>
    </form>
  )
}
