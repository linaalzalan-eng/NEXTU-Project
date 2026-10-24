import { ThemeSwitch } from './ThemeSwitch.jsx'
import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { LogoutButton } from '@/features/auth/components/LogoutButton.jsx'
import { BottomNav } from './BottomNav.jsx'
import { BrandMark } from './BrandMark.jsx'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { PageLoader } from './PageLoader.jsx'
import { SideNav } from './SideNav.jsx'
import { SkipLink } from './SkipLink.jsx'

/** Shell for the app pages: side navigation on desktop, top bar + bottom navigation on mobile. */
export function AppLayout() {
  return (
    <div className="min-h-dvh">
      <SkipLink />
      <SideNav />

      <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2 md:px-6 lg:hidden">
        <BrandMark />
        <div className="flex items-center gap-1">
          <ThemeSwitch compact />
          <LanguageSwitch compact />
          <LogoutButton iconOnly />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pb-[calc(7rem+env(safe-area-inset-bottom))] outline-none lg:ps-64 lg:pb-16">
        <div className="mx-auto w-full min-w-0 max-w-6xl px-4 pt-7 md:px-6 md:pt-9 lg:px-10 lg:pt-10">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
