import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { ToastContext } from './ToastContext.js'

const DISMISS_AFTER_MS = 5000
const MAX_VISIBLE = 3
const ICONS = { info: Info, success: CircleCheck, danger: CircleAlert }
const ICON_COLORS = { info: 'text-ink-2', success: 'text-pine-600', danger: 'text-danger-600' }

/**
 * Info and success toasts close after 5s, but the timer pauses while the toast is
 * hovered or focused (WCAG 2.2.1). Danger toasts stay until the user closes them.
 */
function Toast({ toast, onDismiss }) {
  const { t } = useI18n()
  const [paused, setPaused] = useState(false)
  const Icon = ICONS[toast.variant]
  const autoDismiss = toast.variant !== 'danger'

  useEffect(() => {
    if (!autoDismiss || paused) return
    const timer = setTimeout(() => onDismiss(toast.id), DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [autoDismiss, paused, toast.id, onDismiss])

  return (
    <li
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex flex-wrap items-start gap-2 rounded-lg border border-line bg-surface py-3 ps-4 pe-2 text-sm text-ink shadow-overlay"
    >
      <Icon aria-hidden="true" className={cx('mt-0.5 size-[1.15rem] shrink-0', ICON_COLORS[toast.variant])} />
      <p className="min-w-0 flex-1 basis-24 break-words py-0.5">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            onDismiss(toast.id)
            toast.action.onClick()
          }}
          className="-my-2 h-11 shrink-0 rounded-md px-3 font-medium text-ink underline underline-offset-4 transition-colors hover:bg-sunken"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={t('common.close')}
        className="-my-2 grid size-11 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </li>
  )
}

/** Holds the toast queue and renders it in a polite live region at the bottom-end corner. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ message, variant = 'info', action }) => {
    nextId.current += 1
    const id = nextId.current
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, variant, action }])
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Sits above the bottom navigation (64px + iOS safe area) on mobile. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 sm:start-auto sm:end-6 sm:w-96 lg:bottom-6"
      >
        <ul className="flex flex-col gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </ul>
      </div>
    </ToastContext.Provider>
  )
}
