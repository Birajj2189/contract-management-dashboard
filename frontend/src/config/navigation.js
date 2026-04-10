import {
  LayoutDashboard,
  FileText,
  Users,
  UserCircle,
  BarChart3,
} from 'lucide-react'

/**
 * Second key after pressing `g` (go) navigates to the route.
 * Keep in sync with keyboard handler in useNavigationShortcuts.
 */
export const mainNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    goKey: 'd',
    shortcutLabel: 'G then D',
  },
  {
    to: '/contracts',
    label: 'Contracts',
    icon: FileText,
    goKey: 'c',
    shortcutLabel: 'G then C',
  },
  {
    to: '/parties',
    label: 'Parties',
    icon: UserCircle,
    goKey: 'p',
    shortcutLabel: 'G then P',
  },
]

export const adminNavItems = [
  {
    to: '/users',
    label: 'Users',
    icon: Users,
    goKey: 'u',
    shortcutLabel: 'G then U',
    adminOnly: true,
  },
  {
    to: '/reports',
    label: 'Reports',
    icon: BarChart3,
    goKey: 'r',
    shortcutLabel: 'G then R',
    adminOnly: true,
  },
]

/** @param {boolean} isAdmin */
export function getAllNavItemsForShortcuts(isAdmin) {
  const admin = isAdmin ? adminNavItems : []
  return [...mainNavItems, ...admin]
}

export function buildGoKeyMap(isAdmin) {
  const map = {}
  for (const item of mainNavItems) {
    map[item.goKey.toLowerCase()] = { to: item.to, adminOnly: false }
  }
  if (isAdmin) {
    for (const item of adminNavItems) {
      map[item.goKey.toLowerCase()] = { to: item.to, adminOnly: true }
    }
  }
  return map
}
