import { NavLink } from 'react-router-dom'
import styles from './SidebarNavItem.module.css'

type SidebarNavItemProps = {
  label: string
  path: string
}

export function SidebarNavItem({ label, path }: SidebarNavItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        [styles.navItem, isActive ? styles.active : '']
          .filter(Boolean)
          .join(' ')
      }
    >
      {label}
    </NavLink>
  )
}
