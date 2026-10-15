import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { tasksService } from '@/services'
import { normalizeTitle } from './lib/taskValidation.js'
import { TEMP_ID_PREFIX } from './lib/taskSelectors.js'
import { TasksContext } from './TasksContext.js'

/**
 * Holds the user's full task list (ARCHITECTURE §5) and the actions that change it.
 *
 * Create, toggle, and delete are optimistic (NFR-02): the list changes at once,
 * then the service is called. If the service fails, only the affected task is
 * restored and the error is re-thrown for the caller to report (NFR-21).
 * updateTask waits for the service, because the edit dialog shows a loading state.
 * NOT_FOUND means the task is gone (for example, deleted in another tab), so it is
 * removed locally instead of restored (SRS §4).
 *
 * While a request for a task is in flight, its id is in `busyIds` and the UI blocks
 * further actions on that task. So at most one request per task runs at a time,
 * and restoring the copy taken at the start can never overwrite a newer change.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [loadCount, setLoadCount] = useState(0)
  const [busyIds, setBusyIds] = useState(() => new Set())
  const nextTempId = useRef(0)

  /** Runs one request for a task, marking the task busy until it settles. */
  const withBusy = useCallback(async (id, request) => {
    setBusyIds((current) => new Set(current).add(id))
    try {
      return await request()
    } finally {
      setBusyIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }, [])

  useEffect(() => {
    let ignore = false
    tasksService
      .listTasks()
      .then((list) => {
        if (ignore) return
        setTasks(list)
        setStatus('ready')
      })
      .catch((caught) => {
        if (ignore) return
        setError(caught)
        setStatus('error')
      })
    // Ignore a slow response that arrives after unmount or after a newer reload.
    return () => {
      ignore = true
    }
  }, [loadCount])

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setLoadCount((count) => count + 1)
  }, [])

  const replaceTask = useCallback((id, task) => {
    setTasks((current) => current.map((item) => (item.id === id ? task : item)))
  }, [])

  const removeTask = useCallback((id) => {
    setTasks((current) => current.filter((item) => item.id !== id))
  }, [])

  const createTask = useCallback(
    async (input) => {
      nextTempId.current += 1
      const timestamp = new Date().toISOString()
      const temp = {
        id: `${TEMP_ID_PREFIX}${nextTempId.current}`,
        userId: '',
        title: normalizeTitle(input.title),
        status: 'pending',
        taskDate: input.taskDate,
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      }
      setTasks((current) => [...current, temp])
      try {
        const saved = await tasksService.createTask(input)
        replaceTask(temp.id, saved)
        return saved
      } catch (caught) {
        removeTask(temp.id)
        throw caught
      }
    },
    [replaceTask, removeTask],
  )

  const setTaskCompletion = useCallback(
    async (task, completed) => {
      replaceTask(task.id, {
        ...task,
        status: completed ? 'completed' : 'pending',
        completedAt: completed ? new Date().toISOString() : null,
      })
      try {
        const saved = await withBusy(task.id, () => tasksService.setTaskCompletion(task.id, completed))
        replaceTask(task.id, saved)
        return saved
      } catch (caught) {
        if (caught.code === 'NOT_FOUND') removeTask(task.id)
        else replaceTask(task.id, task)
        throw caught
      }
    },
    [replaceTask, removeTask, withBusy],
  )

  const deleteTask = useCallback(
    async (task) => {
      removeTask(task.id)
      try {
        await withBusy(task.id, () => tasksService.deleteTask(task.id))
      } catch (caught) {
        // Already gone: that is the result the user wanted.
        if (caught.code === 'NOT_FOUND') return
        setTasks((current) => [...current, task])
        throw caught
      }
    },
    [removeTask, withBusy],
  )

  const updateTask = useCallback(
    async (task, changes) => {
      try {
        const saved = await withBusy(task.id, () => tasksService.updateTask(task.id, changes))
        replaceTask(task.id, saved)
        return saved
      } catch (caught) {
        if (caught.code === 'NOT_FOUND') removeTask(task.id)
        throw caught
      }
    },
    [replaceTask, removeTask, withBusy],
  )

  const value = useMemo(
    () => ({ tasks, busyIds, status, error, reload, createTask, updateTask, setTaskCompletion, deleteTask }),
    [tasks, busyIds, status, error, reload, createTask, updateTask, setTaskCompletion, deleteTask],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
