import { useCallback, useMemo } from 'react'
import { useToast } from '@/components/ui/useToast.js'
import { errorMessageKey } from '@/lib/errorMessageKey.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { useTasks } from './useTasks.js'

/**
 * The task actions the UI calls, with user feedback added (USER_FLOW §3–6).
 * When an optimistic action fails, TasksProvider has already restored the list;
 * this hook shows a toast with "Try again". A task that no longer exists gets a
 * short notice instead. These promises never reject, except `update`: the edit
 * dialog awaits it and shows its own error message.
 */
export function useTaskActions() {
  const { createTask, updateTask, setTaskCompletion, deleteTask } = useTasks()
  const { t, formatDay } = useI18n()
  const { showToast } = useToast()

  const report = useCallback(
    (error, retry) => {
      if (error?.code === 'NOT_FOUND') {
        showToast({ message: t('errors.notFound') })
        return
      }
      // Retrying can only help when the problem was the connection or the server.
      const canRetry = !error?.code || error.code === 'NETWORK' || error.code === 'UNKNOWN'
      showToast({
        variant: 'danger',
        message: t(errorMessageKey(error)),
        action: canRetry ? { label: t('common.retry'), onClick: retry } : undefined,
      })
    },
    [showToast, t],
  )

  return useMemo(() => {
    function create(input) {
      return createTask(input).catch((error) => report(error, () => create(input)))
    }

    function toggle(task, completed) {
      return setTaskCompletion(task, completed).catch((error) => report(error, () => toggle(task, completed)))
    }

    function remove(task) {
      return deleteTask(task).then(
        () => showToast({ variant: 'success', message: t('taskDelete.done') }),
        (error) => report(error, () => remove(task)),
      )
    }

    function moveToToday(task, today) {
      return updateTask(task, { taskDate: today }).then(
        () => showToast({ variant: 'success', message: t('task.movedToToday') }),
        (error) => report(error, () => moveToToday(task, today)),
      )
    }

    /** Edit dialog save (BR-08). A new date moves the task off the viewed day, so say where it went. */
    async function update(task, changes) {
      const saved = await updateTask(task, changes)
      if (changes.taskDate) {
        const date = formatDay(changes.taskDate, { day: 'numeric', month: 'long' })
        showToast({ variant: 'success', message: t('taskEdit.movedTo', { date }) })
      }
      return saved
    }

    return { create, toggle, remove, moveToToday, update }
  }, [createTask, updateTask, setTaskCompletion, deleteTask, report, showToast, t, formatDay])
}
