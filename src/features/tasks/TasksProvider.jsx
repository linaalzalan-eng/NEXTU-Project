import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { tasksService } from '@/services'
import { applyCompletion } from './lib/taskCompletion.js'
import { TEMP_ID_PREFIX } from './lib/taskSelectors.js'
import { normalizeTitle } from './lib/taskValidation.js'
import { TasksContext } from './TasksContext.js'

/**
 * Holds the user's full task list (ARCHITECTURE §5) and the actions that change it.
 *
 * Create, toggle, and delete are optimistic (NFR-02): the list changes at once,
 * then the service is called. If the service fails, only what the action changed
 * is undone, on the task as it is now, and the error is re-thrown for the caller
 * to report (NFR-21). So a rollback never overwrites a newer change, even when it
 * comes from a later "Try again" that started from an older copy of the task.
 * updateTask waits for the service, because the edit dialog shows a loading state.
 * NOT_FOUND means the task is gone (for example, deleted in another tab), so it is
 * removed locally instead of restored (SRS §4).
 *
 * While a request for a task is in flight, its id is in `busyIds` and the UI blocks
 * further actions on that task, so at most one request per task runs at a time.
 * A toast's "Try again" is outside that locked UI, so useTaskActions checks `isBusy` first.
 */
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loadStatus, setLoadStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [loadCount, setLoadCount] = useState(0)
  const [busyIds, setBusyIds] = useState(() => new Set())
  const nextTempId = useRef(0)
  const latestTasks = useRef(tasks)
  // Updated synchronously, so a check in the same tick (isBusy) already sees a new request.
  const busyRef = useRef(new Set())

  // A layout effect, so the ref is current before any event handler of the next render runs.
  useLayoutEffect(() => {
    latestTasks.current = tasks
  }, [tasks])

  /** The current version of a task, or undefined when it is gone. For retries started from an older copy. */
  const getTask = useCallback((id) => latestTasks.current.find((task) => task.id === id), [])

  /** True while a request for the task is in flight. Lets callers outside the locked UI (a toast's "Try again") wait their turn. */
  const isBusy = useCallback((id) => busyRef.current.has(id), [])

  /** Runs one request for a task, marking the task busy until it settles. */
  const withBusy = useCallback(async (id, request) => {
    busyRef.current.add(id)
    setBusyIds(new Set(busyRef.current))
    try {
      return await request()
    } finally {
      busyRef.current.delete(id)
      setBusyIds(new Set(busyRef.current))
    }
  }, [])

  useEffect(() => {
    let ignore = false
    tasksService
      .listTasks()
      .then((list) => {
        if (ignore) return
        setTasks(list)
        setLoadStatus('ready')
      })
      .catch((caught) => {
        if (ignore) return
        setError(caught)
        setLoadStatus('error')
      })
    // Ignore a slow response that arrives after unmount or after a newer reload.
    return () => {
      ignore = true
    }
  }, [loadCount])

  const reload = useCallback(() => {
    setLoadStatus('loading')
    setError(null)
    setLoadCount((count) => count + 1)
  }, [])

  /** Applies `change(task)` to the current version of one task. */
  const changeTask = useCallback((id, change) => {
    setTasks((current) => current.map((item) => (item.id === id ? change(item) : item)))
  }, [])

  const replaceTask = useCallback((id, task) => changeTask(id, () => task), [changeTask])

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
      changeTask(task.id, (current) => applyCompletion(current, completed, new Date().toISOString()))
      try {
        const saved = await withBusy(task.id, () => tasksService.setTaskCompletion(task.id, completed))
        replaceTask(task.id, saved)
        return saved
      } catch (caught) {
        if (caught.code === 'NOT_FOUND') removeTask(task.id)
        // Undo only the completion fields, so a newer title or date is kept.
        else changeTask(task.id, (current) => ({ ...current, status: task.status, completedAt: task.completedAt }))
        throw caught
      }
    },
    [changeTask, replaceTask, removeTask, withBusy],
  )

  const deleteTask = useCallback(
    async (task) => {
      // Restore the version that was on screen, not the possibly older argument.
      const shown = latestTasks.current.find((item) => item.id === task.id) ?? task
      removeTask(task.id)
      try {
        await withBusy(task.id, () => tasksService.deleteTask(task.id))
      } catch (caught) {
        // Already gone: that is the result the user wanted.
        if (caught.code === 'NOT_FOUND') return
        setTasks((current) => [...current, shown])
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
    () => ({
      tasks,
      busyIds,
      loadStatus,
      error,
      reload,
      getTask,
      isBusy,
      createTask,
      updateTask,
      setTaskCompletion,
      deleteTask,
    }),
    [tasks, busyIds, loadStatus, error, reload, getTask, isBusy, createTask, updateTask, setTaskCompletion, deleteTask],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}
