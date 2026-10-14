import { NavLink } from 'react-router'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { NAV_ITEMS } from './navItems.js'

/** Mobile navigation (< lg): a fixed bottom bar with the three destinations. */
export function BottomNav() {
  const { t } = useI18n()

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cx(
                  'relative flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150',
                  isActive ? 'text-pine-700' : 'text-ink-3 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cx(
                      'absolute top-0 h-0.5 w-8 rounded-full transition-colors',
                      isActive ? 'bg-pine-600' : 'bg-transparent',
                    )}
                  />
                  <Icon aria-hidden="true" className="size-5" />
                  {t(labelKey)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
