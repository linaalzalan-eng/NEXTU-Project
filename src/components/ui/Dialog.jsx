import { useEffect, useId, useRef } from 'react'

/**
 * Modal dialog built on the native <dialog> element: showModal() traps focus,
 * Escape closes it, and the browser returns focus to the trigger on close.
 * `onClose` runs only when the user closes it (Escape or backdrop), not when
 * the parent sets `open` to false.
 */
export function Dialog({ open, onClose, title, description, children, footer }) {
  const ref = useRef(null)
  const closingFromProp = useRef(false)
  const pressStartedOnBackdrop = useRef(false)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) {
      closingFromProp.current = true
      dialog.close()
    }
  }, [open])

  function handleClose() {
    if (closingFromProp.current) {
      closingFromProp.current = false
      return
    }
    onClose()
  }

  // A click on the backdrop targets the <dialog> element itself. Both the press
  // and the release must be on it, so selecting text inside does not close it.
  function handleMouseDown(event) {
    pressStartedOnBackdrop.current = event.target === ref.current
  }

  function handleClick(event) {
    if (pressStartedOnBackdrop.current && event.target === ref.current) ref.current.close()
    pressStartedOnBackdrop.current = false
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={handleClose}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface p-0 text-ink shadow-overlay"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-ink-2">
            {description}
          </p>
        )}
        {children}
      </div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
    </dialog>
  )
}
