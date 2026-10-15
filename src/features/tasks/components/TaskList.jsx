import { cx } from '@/lib/cx.js'
import { TaskItem } from './TaskItem.jsx'

/**
 * A bordered list of tasks. Optional per-task extras:
 * `getMeta(task)` adds a second line (for example the planned date) and
 * `getAction(task)` adds a control under it (for example "Move to today").
 * `onToggle`, `onEdit`, and `onDelete` are passed to every row. `busyIds` (a Set) marks
 * tasks with a request in flight.
 */
export function TaskList({ tasks, busyIds, getMeta, getAction, onToggle, onEdit, onDelete, className }) {
  return (
    <ul className={cx('divide-y divide-line rounded-lg border border-line bg-surface shadow-hairline', className)}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          meta={getMeta?.(task)}
          action={getAction?.(task)}
          busy={busyIds?.has(task.id) ?? false}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
