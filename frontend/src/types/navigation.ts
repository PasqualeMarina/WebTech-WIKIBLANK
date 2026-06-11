export type NavigationItemId =
  | 'home'
  | 'leaderboard'
  | 'completed-games'

export type NavigationItem = {
  id: NavigationItemId
  label: string
  path: string
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'HOME',
    path: '/home',
  },
  {
    id: 'leaderboard',
    label: 'LEADERBOARD',
    path: '/leaderboard',
  },
  {
    id: 'completed-games',
    label: 'COMPLETED GAMES',
    path: '/completed-games',
  },
]
