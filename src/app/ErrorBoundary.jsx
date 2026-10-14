import { RotateCcw } from 'lucide-react'
import { Component } from 'react'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { I18nContext } from '@/lib/i18n/I18nContext.js'

/**
 * Top-level safety net: shows a recovery screen instead of a blank page (SRS §4).
 * Error boundaries must be class components; this is the only one in the app.
 */
export class ErrorBoundary extends Component {
  static contextType = I18nContext

  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Details stay in the developer console and are never shown to users (NFR-14).
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const { t } = this.context
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-ink">{t('error.title')}</h1>
          <p className="mt-2 text-ink-2">{t('error.body')}</p>
          <button type="button" onClick={() => window.location.reload()} className={buttonStyles({ className: 'mt-6' })}>
            <RotateCcw aria-hidden="true" className="size-[1.15em]" />
            {t('error.reload')}
          </button>
        </div>
      </main>
    )
  }
}
