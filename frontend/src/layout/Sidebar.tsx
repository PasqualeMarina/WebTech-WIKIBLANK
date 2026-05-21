import { SidebarNavItem } from './SidebarNavItem'
import { navigationItems } from '../types/navigation'
import styles from './Sidebar.module.css'

export function Sidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <img src="/wikiBlankLOGO.png" alt="WikiBlankLogo" />
      </div>

      <nav className={styles.sidebarNav}>
        {navigationItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            label={item.label}
            path={item.path}
            isEnabled={item.isEnabled}
          />
        ))}
      </nav>
    </aside>
  )
}
