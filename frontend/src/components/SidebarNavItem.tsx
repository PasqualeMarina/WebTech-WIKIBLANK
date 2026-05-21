import styles from './SidebarNavItem.module.css'

type SidebarNavItemProps = {
  label: string
  path: string
  isActive: boolean
  isEnabled: boolean
  onClick: () => void
}

export function SidebarNavItem({
  label,
  path,
  isActive,
  isEnabled,
  onClick,
}: SidebarNavItemProps) {
  const className = [
    styles.navItem,
    isActive ? styles.active : '',
    !isEnabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (!isEnabled) {
    return (
      <button
        type="button"
        className={className}
        aria-disabled="true"
        onClick={onClick}
      >
        {label}
      </button>
    )
  }

  return (
    <a
      href={path}
      className={className}
      aria-current={isActive ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault()
        onClick()
      }}
    >
      {label}
    </a>
  )
}
