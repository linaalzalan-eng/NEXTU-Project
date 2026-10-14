import { Outlet } from 'react-router'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { BrandMark } from './BrandMark.jsx'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { SkipLink } from './SkipLink.jsx'

/**
 * Shell for the account screens. On desktop the start half is an ink panel with
 * the product philosophy; the form sits in the end half.
 */
export function AuthLayout() {
  const { t } = useI18n()

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <SkipLink />

      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col">
        <BrandMark inverted />
        <div className="my-auto max-w-md">
          <p className="text-4xl leading-tight font-semibold">{t('auth.quote')}</p>
          <p className="mt-5 text-lg text-paper/70">{t('auth.quoteNote')}</p>
        </div>
        {/* The "past self" motif at large scale: dashed past, solid present. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="absolute -end-24 -bottom-24 size-96 text-paper/15"
        >
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="12 12" />
          <path
            d="M100 20a80 80 0 0 1 0 160"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-pine-50/40"
          />
        </svg>
      </aside>

      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between px-4 md:px-6 lg:justify-end lg:px-10">
          <BrandMark className="lg:hidden" />
          <LanguageSwitch />
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 py-10 outline-none md:px-6">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
