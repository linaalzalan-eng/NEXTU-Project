import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router'
import { Alert } from '@/components/ui/Alert.jsx'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { usePreviewState } from './usePreviewState.js'

/**
 * PHASE 2 PREVIEW ONLY (D-22): says the page shows sample data and switches
 * between the sample and empty states for design review.
 */
export function PreviewNotice({ messageKey }) {
  const { t } = useI18n()
  const state = usePreviewState()

  return (
    <Alert
      icon={FlaskConical}
      className="mb-8"
      action={
        <Link
          to={{ search: state === 'empty' ? '' : '?preview=empty' }}
          replace
          className={buttonStyles({ variant: 'secondary', size: 'sm' })}
        >
          {state === 'empty' ? t('preview.showSample') : t('preview.showEmpty')}
        </Link>
      }
    >
      <span className="me-2 rounded-sm bg-ink px-1.5 py-0.5 text-xs font-semibold text-paper">{t('preview.badge')}</span>
      {t(messageKey)}
    </Alert>
  )
}
