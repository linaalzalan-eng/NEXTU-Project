import { LogIn } from 'lucide-react'
import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { buttonStyles } from '@/components/ui/buttonStyles.js'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { BottomNav } from './BottomNav.jsx'
import { BrandMark } from './BrandMark.jsx'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { PageLoader } from './PageLoader.jsx'
import { SideNav } from './SideNav.jsx'
import { SkipLink } from './SkipLink.jsx'

/** Shell for the app pages: side navigation on desktop, top bar + bottom navigation on mobile. */
export function AppLayout() {
  const { t } = useI18n()

  return (
    <div className="min-h-dvh">
      <SkipLink />
      <SideNav />

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-line bg-paper px-4 md:px-6 lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-1">
          <LanguageSwitch />
          <Link
            to="/login"
            aria-label={t('nav.login')}
            className={buttonStyles({ variant: 'ghost', iconOnly: true })}
          >
            <LogIn aria-hidden="true" className="size-[1.15rem] rtl:-scale-x-100" />
          </Link>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pb-28 outline-none lg:ps-64 lg:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 md:px-6 lg:px-10 lg:pt-12">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
