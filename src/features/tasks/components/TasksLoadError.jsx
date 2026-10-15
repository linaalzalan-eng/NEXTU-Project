import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * The error state of every view that reads the task list (Tasks, Dashboard,
 * Analytics): a plain-language message (NFR-14) and a Retry button.
 */
export function TasksLoadError({ error, onRetry }) {
  const { t } = useI18n()

  return (
    <Alert
      variant="danger"
      title={t('tasks.loadError')}
      action={
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      }
    >
      {t(errorMessageKey(error))}
    </Alert>
  )
}
