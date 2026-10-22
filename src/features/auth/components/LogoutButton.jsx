import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { Spinner } from '@/components/ui/Spinner.jsx'
import { useToast } from '@/components/ui/useToast.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { useAuth } from '../useAuth.js'

/**
 * Log out (US-03, FR-03), in the app layout on every protected page. After it, the
 * signed-out state makes ProtectedRoute send the user to /login and drop the tasks.
 * `iconOnly` is the compact version for the mobile top bar; `className` styles the full one.
 */
export function LogoutButton({ iconOnly = false, className }) {
  const { t } = useI18n()
  const { showToast } = useToast()
  const { signOut } = useAuth()
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    try {
      await signOut()
    } catch (caught) {
      showToast({ variant: 'danger', message: t(errorMessageKey(caught)) })
      setPending(false)
    }
  }

  const icon = pending ? (
    <Spinner />
  ) : (
    <LogOut aria-hidden="true" className="size-[1.15rem] shrink-0 rtl:-scale-x-100" />
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={pending || undefined}
      aria-label={iconOnly ? t('nav.logout') : undefined}
      className={iconOnly ? buttonStyles({ variant: 'ghost', iconOnly: true }) : cx(className)}
    >
      {icon}
      {!iconOnly && t('nav.logout')}
    </button>
  )
}
