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
  if (!isEnabled) {
    return (
      <button
        type="button"
        className="nav-item disabled"
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
      className={isActive ? 'nav-item active' : 'nav-item'}
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
