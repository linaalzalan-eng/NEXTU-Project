import { ThemeSwitch } from './ThemeSwitch.jsx'
import { NavLink } from 'react-router'
import { LogoutButton } from '@/features/auth/components/LogoutButton.jsx'
import { useI18n } from '@/lib/i18n/useI18n.js'
import { cx } from '@/lib/cx.js'
import { BrandMark } from './BrandMark.jsx'
import { LanguageSwitch } from './LanguageSwitch.jsx'
import { NAV_ITEMS } from './navItems.js'

function sideLinkClass({ isActive }) {
  return cx(
    'flex h-11 items-center gap-3 rounded-md border-s-3 px-3 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'border-pine-600 bg-pine-50 text-pine-700'
      : 'border-transparent text-ink-2 hover:bg-sunken hover:text-ink',
  )
}

/** Desktop navigation (≥ lg), fixed on the start side: right in Arabic, left in English. */
export function SideNav() {
  const { t } = useI18n()

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col overflow-y-auto border-e border-line bg-surface px-4 py-7 lg:flex">
      <BrandMark className="px-2" />
      <p className="mt-3 px-2 text-sm leading-snug text-ink-3">{t('app.tagline')}</p>

      <nav aria-label={t('nav.label')} className="mt-10">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
            <li key={to}>
              <NavLink to={to} className={sideLinkClass}>
                <Icon aria-hidden="true" className="size-[1.15rem] shrink-0" />
                {t(labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-5">
        <LogoutButton className={cx(sideLinkClass({ isActive: false }), 'w-full')} />
        <LanguageSwitch className="w-full" />
        <ThemeSwitch />
      </div>
    </aside>
  )
}
