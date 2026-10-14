import { cx } from '@/lib/cx.js'
import { TaskItem } from './TaskItem.jsx'

/** A bordered list of tasks. `getMeta(task)` optionally adds a second line (for example the planned date). */
export function TaskList({ tasks, getMeta, className }) {
  return (
    <ul className={cx('divide-y divide-line rounded-lg border border-line bg-surface shadow-hairline', className)}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} meta={getMeta?.(task)} />
      ))}
    </ul>
  )
}
