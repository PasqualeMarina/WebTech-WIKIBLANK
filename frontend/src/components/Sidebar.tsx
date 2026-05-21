import { SidebarNavItem } from './SidebarNavItem'

const sidebarItems = [
  'HOME',
  'CLASSIFICA',
  'PARTITE CONCLUSE',
  'IMPOSTAZIONI',
]

type SidebarProps = {
  activeItem: string
}

export function Sidebar({ activeItem }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Navigazione principale">
      <div className="brand">
        <img src="/wikiBlankLOGO.png" alt="WikiBlank" />
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <SidebarNavItem
            key={item}
            label={item}
            isActive={item === activeItem}
          />
        ))}
      </nav>
    </aside>
  )
}
