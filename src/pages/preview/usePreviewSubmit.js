import { useToast } from '@/components/ui/useToast.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * PHASE 2 PREVIEW ONLY (D-22): the auth forms are not connected yet,
 * so submitting shows a notice instead. Replaced by real handlers in Phase 5.
 */
export function usePreviewSubmit() {
  const { t } = useI18n()
  const { showToast } = useToast()

  return (event) => {
    event.preventDefault()
    showToast({ message: t('auth.previewToast') })
  }
}
