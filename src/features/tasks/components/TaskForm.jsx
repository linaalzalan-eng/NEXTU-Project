import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { useToast } from '@/components/ui/useToast.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { getTaskDateRange, validateTaskInput } from '../lib/taskValidation.js'

/**
 * Quick add (US-07): one title field, a date that defaults to the viewed day,
 * and Enter to submit. The list updates at once (optimistic), so the field
 * clears and keeps focus for the next task. The parent resets the form with
 * `key` when the viewed day changes.
 */
export function TaskForm({ defaultDate, today, onCreate }) {
  const { t, formatDay } = useI18n()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(defaultDate)
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)
  const dateRef = useRef(null)
  const range = getTaskDateRange(today)

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTaskInput({ title, taskDate }, today)
    setErrors(nextErrors)
    if (nextErrors.title) return titleRef.current.focus()
    if (nextErrors.taskDate) return dateRef.current.focus()

    // onCreate resolves with the saved task, or with nothing if saving failed
    // (the failure has its own message). Confirm another day only after it is saved.
    Promise.resolve(onCreate({ title, taskDate })).then((saved) => {
      if (saved && taskDate !== defaultDate) {
        const date = formatDay(taskDate, { day: 'numeric', month: 'long' })
        showToast({ variant: 'success', message: t('taskForm.addedFor', { date }) })
      }
    })
    setTitle('')
    titleRef.current.focus()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        ref={titleRef}
        label={t('taskForm.titleLabel')}
        placeholder={t('taskForm.titlePlaceholder')}
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
        }}
        error={errors.title && t(`validation.title.${errors.title}`)}
        dir="auto"
        autoComplete="off"
        className="sm:flex-1"
      />
      <div className="flex items-start gap-3">
        <Input
          ref={dateRef}
          type="date"
          label={t('taskForm.dateLabel')}
          value={taskDate}
          min={range.min}
          max={range.max}
          onChange={(event) => {
            setTaskDate(event.target.value)
            if (errors.taskDate) setErrors((current) => ({ ...current, taskDate: undefined }))
          }}
          error={errors.taskDate && t(`validation.taskDate.${errors.taskDate}`)}
          className="flex-1 sm:w-44 sm:flex-none"
        />
        {/* Aligns with the inputs: label height (1.25rem line + 0.375rem gap) above. */}
        <Button type="submit" icon={Plus} className="mt-[1.625rem] h-12">
          {t('taskForm.submit')}
        </Button>
      </div>
    </form>
  )
}
