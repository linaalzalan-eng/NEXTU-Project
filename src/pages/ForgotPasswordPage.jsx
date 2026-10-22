import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { EmailSent } from '@/features/auth/components/EmailSent.jsx'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** /forgot-password (US-26, D-19). Public-only. The answer never says whether the email has an account. */
export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [sentTo, setSentTo] = useState(null)

  if (sentTo) {
    return <EmailSent title={t('auth.forgot.sentTitle')} body={t('auth.forgot.sentBody', { email: sentTo })} />
  }

  return (
    <>
      <AuthHeader title={t('auth.forgot.title')} lede={t('auth.forgot.lede')} />
      <ForgotPasswordForm onSent={setSentTo} />
      <Link to="/login" className={textLink({ className: 'mt-8 inline-flex items-center gap-1.5 text-sm' })}>
        <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        {t('auth.forgot.back')}
      </Link>
    </>
  )
}
