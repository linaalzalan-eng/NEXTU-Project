import { CalendarArrowUp } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { TaskList } from './TaskList.jsx'

/**
 * Pending tasks from earlier days (FR-17, US-16, BR-09). They stay on their
 * original day until completed or moved; "Move to today" moves one in one action.
 * Renders nothing when there are none.
 */
export function OverdueSection({ tasks, busyIds, onToggle, onMoveToToday, className }) {
  const { t, formatDay } = useI18n()
  const headingId = useId()
  if (tasks.length === 0) return null

  return (
    <section
      aria-labelledby={headingId}
      className={cx('min-w-0 rounded-lg border border-warning-700/25 bg-warning-50 p-4 md:p-5', className)}
    >
      <h2 id={headingId} className="font-semibold text-warning-700">
        {t('tasks.overdueHeading', { count: tasks.length })}
      </h2>
      <p className="mt-1 text-sm text-warning-700">{t('tasks.overdueHint')}</p>
      <TaskList
        tasks={tasks}
        busyIds={busyIds}
        onToggle={onToggle}
        getMeta={(task) =>
          t('task.plannedFor', { date: formatDay(task.taskDate, { weekday: 'short', day: 'numeric', month: 'short' }) })
        }
        getAction={(task, { locked }) => (
          <Button
            variant="secondary"
            icon={CalendarArrowUp}
            // The visible text comes first, so the name still matches what is seen (WCAG 2.5.3).
            aria-label={t('task.moveToTodayNamed', { title: task.title })}
            disabled={locked}
            onClick={() => onMoveToToday(task)}
          >
            {t('task.moveToToday')}
          </Button>
        )}
        className="mt-4"
      />
    </section>
  )
}
