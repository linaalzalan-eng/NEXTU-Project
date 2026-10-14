import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { Alert } from '@/components/ui/Alert.jsx'
import { textLink } from '@/components/ui/textLink.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Overdue summary with a link to the Tasks page (FR-24, BR-09). */
export function OverdueBanner({ count }) {
  const { t } = useI18n()

  return (
    <Alert variant="warning" title={t('dashboard.overdueTitle', { count })}>
      <p>{t('dashboard.overdueBody')}</p>
      <Link to="/tasks" className={textLink({ tone: 'warning', className: 'mt-2 inline-flex items-center gap-1' })}>
        {t('dashboard.overdueAction')}
        <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      </Link>
    </Alert>
  )
}
