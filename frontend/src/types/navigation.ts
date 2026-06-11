export type NavigationItemId =
  | 'home'
  | 'leaderboard'
  | 'completed-games'

export type NavigationItem = {
  id: NavigationItemId
  label: string
  path: string
  icon: string
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/home',
    icon: 'home',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: 'trophy',
  },
  {
    id: 'completed-games',
    label: 'Completed Games',
    path: '/completed-games',
    icon: 'history',
  },
]
