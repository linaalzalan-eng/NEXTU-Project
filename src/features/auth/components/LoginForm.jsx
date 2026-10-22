import { Link } from 'react-router'
import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { validateLoginInput } from '../lib/authValidation.js'
import { useAuth } from '../useAuth.js'
import { useAuthForm } from '../useAuthForm.js'

/**
 * Login (US-02, FR-02, FR-07). Wrong email and wrong password give the same message.
 * After a successful login, PublicOnlyRoute moves the user to the page they asked for.
 */
export function LoginForm() {
  const { t } = useI18n()
  const { signIn } = useAuth()
  const form = useAuthForm({
    initialValues: { email: '', password: '' },
    validate: validateLoginInput,
    onSubmit: signIn,
  })

  return (
    <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-5">
      {form.formError && <Alert variant="danger">{t(errorMessageKey(form.formError))}</Alert>}
      <Input label={t('auth.email')} type="email" autoComplete="email" dir="ltr" {...form.field('email')} />
      <div>
        <Input
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          dir="ltr"
          {...form.field('password')}
        />
        <Link to="/forgot-password" className={textLink({ className: 'mt-2 inline-block text-sm' })}>
          {t('auth.login.forgot')}
        </Link>
      </div>
      <Button type="submit" loading={form.submitting} className="mt-2 w-full">
        {t('auth.login.submit')}
      </Button>
    </form>
  )
}
