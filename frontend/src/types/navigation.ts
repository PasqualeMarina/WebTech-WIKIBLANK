export type NavigationItemId =
  | 'home'
  | 'leaderboard'
  | 'completed-games'
  | 'settings'

export type NavigationItem = {
  id: NavigationItemId
  label: string
  path: string
  isEnabled: boolean
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'HOME',
    path: '/home',
    isEnabled: true,
  },
  {
    id: 'leaderboard',
    label: 'LEADERBOARD',
    path: '/leaderboard',
    isEnabled: true,
  },
  {
    id: 'completed-games',
    label: 'COMPLETED GAMES',
    path: '/completed-games',
    isEnabled: false,
  },
  {
    id: 'settings',
    label: 'SETTINGS',
    path: '/settings',
    isEnabled: false,
  },
]

export function getNavigationItemFromPath(pathname: string): NavigationItemId {
  const matchingItem = navigationItems.find(
    (item) => item.path === pathname && item.isEnabled,
  )

  return matchingItem?.id ?? 'home'
}

export function getNavigationPath(itemId: NavigationItemId) {
  return (
    navigationItems.find((item) => item.id === itemId && item.isEnabled)?.path ??
    '/home'
  )
}
