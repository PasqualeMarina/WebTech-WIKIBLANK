import { NavLink } from 'react-router-dom'
import styles from './SidebarNavItem.module.css'

type SidebarNavItemProps = {
  label: string
  path: string
  isEnabled: boolean
}

export function SidebarNavItem({
  label,
  path,
  isEnabled,
}: SidebarNavItemProps) {
  if (!isEnabled) {
    return (
      <button
        type="button"
        className={[styles.navItem, styles.disabled].join(' ')}
        aria-disabled="true"
      >
        {label}
      </button>
    )
  }

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
