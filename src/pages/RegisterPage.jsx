import { useState } from 'react'
import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { EmailSent } from '@/features/auth/components/EmailSent.jsx'
import { RegisterForm } from '@/features/auth/components/RegisterForm.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** /register (US-01). After a sign-up that needs confirmation, the form gives way to "check your email" (D-18). */
export default function RegisterPage() {
  const { t } = useI18n()
  const [sentTo, setSentTo] = useState(null)

  if (sentTo) {
    return <EmailSent title={t('auth.register.checkTitle')} body={t('auth.register.checkBody', { email: sentTo })} />
  }

  return (
    <>
      <AuthHeader title={t('auth.register.title')} lede={t('auth.register.lede')} />
      <RegisterForm onConfirmationSent={setSentTo} />
      <p className="mt-7 border-t border-line pt-6 text-center text-sm text-ink-2">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className={textLink()}>
          {t('auth.register.login')}
        </Link>
      </p>
    </>
  )
}
