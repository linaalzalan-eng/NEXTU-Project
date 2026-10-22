import { ArrowLeft, MailCheck } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { AuthHeader } from '@/components/layout/AuthHeader.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * "Check your email", after registering with confirmation on (D-18) or asking for a
 * reset link (D-19). The text is the same whether or not the address has an account,
 * so the screen never reveals who is registered. Focus moves to the heading, because
 * the form the user was in has just disappeared.
 */
export function EmailSent({ title, body }) {
  const { t } = useI18n()
  const headingRef = useRef(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <>
      <MailCheck aria-hidden="true" className="mb-5 size-10 text-pine-600" />
      <AuthHeader title={title} lede={body} headingRef={headingRef} />
      <Link to="/login" className={textLink({ className: 'inline-flex items-center gap-1.5 text-sm' })}>
        <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        {t('auth.forgot.back')}
      </Link>
    </>
  )
}
