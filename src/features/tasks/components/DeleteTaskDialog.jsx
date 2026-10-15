import { useState } from 'react'
import { Button } from '@/components/ui/Button.jsx'
import { Dialog } from '@/components/ui/Dialog.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * Confirms a permanent delete (US-12). The text states that the task also leaves
 * past statistics (BR-07). Open while `task` is set.
 */
export function DeleteTaskDialog({ task, onConfirm, onClose }) {
  const { t } = useI18n()
  // Keep showing the title while the dialog closes.
  const [shownTask, setShownTask] = useState(task)
  if (task && task !== shownTask) setShownTask(task)

  return (
    <Dialog
      open={task !== null}
      onClose={onClose}
      title={t('taskDelete.title')}
      description={t('taskDelete.body')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm(task)
              onClose()
            }}
          >
            {t('taskDelete.confirm')}
          </Button>
        </>
      }
    >
      {shownTask && (
        <p dir="auto" className="mt-4 rounded-md bg-sunken px-3 py-2 font-medium break-words">
          {shownTask.title}
        </p>
      )}
    </Dialog>
  )
}
