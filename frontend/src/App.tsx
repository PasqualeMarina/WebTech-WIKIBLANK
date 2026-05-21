import { useEffect, useState } from 'react'
import './App.css'
import { HomePage } from './components/HomePage'
import { LeaderboardPage } from './components/LeaderboardPage'
import { Sidebar } from './components/Sidebar'
import {
  getNavigationItemFromPath,
  getNavigationPath,
  navigationItems,
  type NavigationItemId,
} from './types/navigation'

function App() {
  const [activeItem, setActiveItem] = useState<NavigationItemId>(() =>
    getNavigationItemFromPath(window.location.pathname),
  )

  useEffect(() => {
    const syncRouteFromUrl = () => {
      const nextItem = getNavigationItemFromPath(window.location.pathname)
      const normalizedPath = getNavigationPath(nextItem)

      if (window.location.pathname !== normalizedPath) {
        window.history.replaceState(null, '', normalizedPath)
      }

      setActiveItem(nextItem)
    }

    syncRouteFromUrl()
    window.addEventListener('popstate', syncRouteFromUrl)

    return () => {
      window.removeEventListener('popstate', syncRouteFromUrl)
    }
  }, [])

  const handleNavigation = (itemId: NavigationItemId) => {
    const targetItem = navigationItems.find((item) => item.id === itemId)

    if (!targetItem?.isEnabled) {
      return
    }

    if (window.location.pathname !== targetItem.path) {
      window.history.pushState(null, '', targetItem.path)
    }

    setActiveItem(itemId)
  }

  const currentPage =
    activeItem === 'leaderboard' ? <LeaderboardPage /> : <HomePage />

  return (
    <main className="app-shell">
      <Sidebar activeItem={activeItem} onSelect={handleNavigation} />
      {currentPage}
    </main>
  )
}

export default App
