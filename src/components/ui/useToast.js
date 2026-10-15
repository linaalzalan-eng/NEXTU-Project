import { useContext } from 'react'
import { ToastContext } from './ToastContext.js'

/**
 * Returns { showToast({ message, variant, action }) } where variant is 'info' | 'success' | 'danger'
 * and the optional action is { label, onClick } (for example "Try again"); it closes the toast.
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
