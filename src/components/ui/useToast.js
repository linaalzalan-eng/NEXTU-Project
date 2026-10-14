import { useContext } from 'react'
import { ToastContext } from './ToastContext.js'

/** Returns { showToast({ message, variant }) } where variant is 'info' | 'success' | 'danger'. */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
