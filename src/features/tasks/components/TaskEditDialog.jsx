import { useRef, useState } from 'react'
import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Dialog } from '@/components/ui/Dialog.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { useToast } from '@/components/ui/useToast.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { getTaskDateRange, normalizeTitle, validateTaskInput } from '../lib/taskValidation.js'

/**
 * Edit a task's title and date (US-08, US-09, BR-08). Open while `task` is set.
 * Saving waits for the service and shows a loading state (NFR-02); on failure the
 * dialog stays open with the message. Cancel and Escape discard the changes.
 * `onSave(task, changes)` receives only the fields that changed.
 */
export function TaskEditDialog({ task, today, onSave, onClose }) {
  const { t } = useI18n()
  const { showToast } = useToast()
  const titleRef = useRef(null)
  const dateRef = useRef(null)
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const range = getTaskDateRange(today)

  // Prefill each time the dialog opens, including reopening the same task after
  // a cancelled edit ("adjusting state when a prop changes" in the React docs).
  const [previousTask, setPreviousTask] = useState(null)
  if (task !== previousTask) {
    setPreviousTask(task)
    if (task) {
      setTitle(task.title)
      setTaskDate(task.taskDate)
      setErrors({})
      setSaveError(null)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTaskInput({ title, taskDate }, today)
    setErrors(nextErrors)
    if (nextErrors.title) return titleRef.current.focus()
    if (nextErrors.taskDate) return dateRef.current.focus()

    const changes = {}
    if (normalizeTitle(title) !== task.title) changes.title = title
    if (taskDate !== task.taskDate) changes.taskDate = taskDate
    if (Object.keys(changes).length === 0) return onClose()

    setSaving(true)
    setSaveError(null)
    try {
      await onSave(task, changes)
      onClose()
    } catch (error) {
      // The task is gone (deleted elsewhere); the list has already dropped it (SRS §4).
      if (error.code === 'NOT_FOUND') {
        showToast({ message: t('errors.notFound') })
        onClose()
      } else {
        setSaveError(error)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={task !== null}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={t('taskEdit.title')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {t('taskEdit.save')}
          </Button>
        </>
      }
    >
      <div className="mt-5 flex flex-col gap-4">
        {saveError && <Alert variant="danger">{t(errorMessageKey(saveError))}</Alert>}
        <Input
          ref={titleRef}
          label={t('taskEdit.titleLabel')}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={errors.title && t(`validation.title.${errors.title}`)}
          dir="auto"
          autoComplete="off"
        />
        <Input
          ref={dateRef}
          type="date"
          label={t('taskEdit.dateLabel')}
          value={taskDate}
          min={range.min}
          max={range.max}
          onChange={(event) => setTaskDate(event.target.value)}
          error={errors.taskDate && t(`validation.taskDate.${errors.taskDate}`)}
        />
      </div>
    </Dialog>
  )
}
