import { Spinner } from '@/components/ui/Spinner.jsx'

/** Shown while a lazy-loaded page is downloading. */
export function PageLoader() {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center text-ink-3">
      <Spinner className="text-2xl" />
    </div>
  )
}
