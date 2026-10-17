import { useCallback, useMemo } from 'react'
import { useToast } from '@/components/ui/useToast.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { useTasks } from './useTasks.js'

/**
 * The task actions the UI calls, with user feedback added (USER_FLOW §3–6).
 * When an optimistic action fails, TasksProvider has already restored the list;
 * this hook shows a toast with "Try again". A task that no longer exists gets a
 * short notice instead (SRS §4), always from here.
 *
 * One contract for all of them: the promise never rejects. It resolves to the
 * task (the saved one; for `remove`, the task that was deleted), or to null when
 * the action failed and the user has been told. Deleting a task that was already
 * gone counts as success. The one exception is `saveEdit`: the edit dialog shows
 * its own error message, so any failure other than "no longer exists" rejects
 * with the ServiceError.
 *
 * "Try again" starts from the current version of the task (`getTask`), not the
 * copy from the first attempt, so it cannot bring back an older title or date.
 * It does nothing while another request for that task is in flight (`isBusy`):
 * that request reports its own result, and one request per task stays the rule.
 */
export function useTaskActions() {
  const { getTask, isBusy, createTask, updateTask, setTaskCompletion, deleteTask } = useTasks()
  const { t, formatDay } = useI18n()
  const { showToast } = useToast()

  const notifyGone = useCallback(() => showToast({ message: t('errors.notFound') }), [showToast, t])

  /** Tells the user about a failure and resolves the action to null. */
  const reportFailure = useCallback(
    (error, retry) => {
      if (error?.code === 'NOT_FOUND') {
        notifyGone()
        return null
      }
      // Retrying can only help when the problem was the connection or the server.
      const canRetry = !error?.code || error.code === 'NETWORK' || error.code === 'UNKNOWN'
      showToast({
        variant: 'danger',
        message: t(errorMessageKey(error)),
        action: canRetry ? { label: t('common.retry'), onClick: retry } : undefined,
      })
      return null
    },
    [notifyGone, showToast, t],
  )

  return useMemo(() => {
    /** Runs `action` again on the current version of the task; tells the user if it is gone. */
    function retryWithLatest(task, action) {
      return () => {
        if (isBusy(task.id)) return
        const latest = getTask(task.id)
        if (latest) action(latest)
        else notifyGone()
      }
    }

    function create(input) {
      return createTask(input).catch((error) => reportFailure(error, () => create(input)))
    }

    function setCompleted(task, completed) {
      return setTaskCompletion(task, completed).catch((error) =>
        reportFailure(error, retryWithLatest(task, (latest) => setCompleted(latest, completed))),
      )
    }

    function remove(task) {
      return deleteTask(task).then(
        () => {
          showToast({ variant: 'success', message: t('taskDelete.done') })
          return task
        },
        (error) => reportFailure(error, retryWithLatest(task, remove)),
      )
    }

    function moveToToday(task, today) {
      return updateTask(task, { taskDate: today }).then(
        (saved) => {
          showToast({ variant: 'success', message: t('task.movedToToday') })
          return saved
        },
        (error) => reportFailure(error, retryWithLatest(task, (latest) => moveToToday(latest, today))),
      )
    }

    /** Edit dialog save (BR-08). A new date moves the task off the viewed day, so say where it went. */
    async function saveEdit(task, changes) {
      let saved
      try {
        saved = await updateTask(task, changes)
      } catch (error) {
        // The list has already dropped it; the dialog just closes.
        if (error?.code === 'NOT_FOUND') return reportFailure(error)
        throw error
      }
      if (changes.taskDate) {
        const date = formatDay(changes.taskDate, { day: 'numeric', month: 'long' })
        showToast({ variant: 'success', message: t('taskEdit.movedTo', { date }) })
      }
      return saved
    }

    return { create, setCompleted, remove, moveToToday, saveEdit }
  }, [getTask, isBusy, createTask, updateTask, setTaskCompletion, deleteTask, notifyGone, reportFailure, showToast, t, formatDay])
}
