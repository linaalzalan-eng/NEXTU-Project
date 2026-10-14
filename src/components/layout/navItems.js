import { ChartNoAxesColumn, ListChecks, Sun } from 'lucide-react'

/** The three app destinations, shared by SideNav and BottomNav. */
export const NAV_ITEMS = [
  { to: '/dashboard', labelKey: 'nav.today', icon: Sun },
  { to: '/tasks', labelKey: 'nav.tasks', icon: ListChecks },
  { to: '/analytics', labelKey: 'nav.analytics', icon: ChartNoAxesColumn },
]
