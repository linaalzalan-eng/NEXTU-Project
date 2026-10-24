import { Outlet } from 'react-router'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { AuthProductPreview } from './AuthProductPreview.jsx'
import { BrandMark } from './BrandMark.jsx'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { ThemeSwitch } from './ThemeSwitch.jsx'
import { SkipLink } from './SkipLink.jsx'

/** Shared visual shell only; existing auth routes and form handlers remain unchanged. */
export function AuthLayout() {
  const { t } = useI18n()
  return (
    <div data-auth-design="product-preview-v2" className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <SkipLink />
      <aside className="hidden min-h-dvh flex-col bg-inverse px-10 py-8 text-on-inverse lg:flex xl:px-14">
        <BrandMark inverted />
        <div className="mx-auto my-auto w-full max-w-[27rem] py-8">
          <p className="mb-3 text-xs font-medium text-inverse-muted">{t('auth.branding.eyebrow')}</p>
          <h2 className="max-w-md whitespace-pre-line text-[2rem] leading-[1.25] font-semibold xl:text-[2.5rem]">{t('auth.branding.title')}</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-inverse-muted">{t('auth.branding.subtitle')}</p>
          <div className="mt-7 max-w-[27rem]"><AuthProductPreview /></div>
        </div>
        <p className="text-xs text-inverse-muted">{t('auth.branding.footer')}</p>
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="flex min-h-20 items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:justify-end lg:px-10">
          <BrandMark className="lg:hidden" />
          <div className="flex items-center gap-2"><ThemeSwitch compact /><LanguageSwitch /></div>
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-5 pb-12 pt-6 outline-none sm:px-8 lg:px-12 lg:pb-20 lg:pt-8">
          <div className="w-full max-w-[25rem]">
            <Outlet />
          </div>
        </main>
        <p className="px-6 pb-6 text-center text-xs text-ink-3 lg:hidden">{t('auth.branding.footer')}</p>
      </div>
    </div>
  )
}
