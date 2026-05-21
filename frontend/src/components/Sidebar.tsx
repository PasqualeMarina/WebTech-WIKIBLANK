import { SidebarNavItem } from './SidebarNavItem'
import { navigationItems, type NavigationItemId } from '../types/navigation'
import styles from './Sidebar.module.css'

type SidebarProps = {
  activeItem: NavigationItemId
  onSelect: (item: NavigationItemId) => void
}

export function Sidebar({ activeItem, onSelect }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <img src="/wikiBlankLOGO.png" alt="WikiBlank" />
      </div>

      <nav className={styles.sidebarNav}>
        {navigationItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            label={item.label}
            path={item.path}
            isActive={item.id === activeItem}
            isEnabled={item.isEnabled}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </nav>
    </aside>
  )
}
