import { Spinner } from '@/components/ui/Spinner.jsx'
import { cx } from '@/lib/cx.js'

/** Shown while a lazy-loaded page is downloading, or (`fullScreen`) while the saved session is restored (US-04). */
export function PageLoader({ fullScreen = false }) {
  return (
    <div role="status" className={cx('grid place-items-center text-ink-3', fullScreen ? 'min-h-dvh' : 'min-h-[50vh]')}>
      <Spinner className="text-2xl" />
    </div>
  )
}
