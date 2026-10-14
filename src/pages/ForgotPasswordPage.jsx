import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { usePreviewSubmit } from './preview/usePreviewSubmit.js'

/** Layout only in Phase 2; the reset request arrives in Phase 5 (US-26, D-19). */
export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const handleSubmit = usePreviewSubmit()

  return (
    <>
      <AuthHeader title={t('auth.forgot.title')} lede={t('auth.forgot.lede')} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input label={t('auth.email')} name="email" type="email" autoComplete="email" dir="ltr" />
        <Button type="submit" className="mt-2 w-full">
          {t('auth.forgot.submit')}
        </Button>
      </form>
      <Link to="/login" className={textLink({ className: 'mt-8 inline-flex items-center gap-1.5 text-sm' })}>
        <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        {t('auth.forgot.back')}
      </Link>
    </>
  )
}
