type SidebarNavItemProps = {
  label: string
  isActive: boolean
}

export function SidebarNavItem({ label, isActive }: SidebarNavItemProps) {
  return (
    <button
      type="button"
      className={isActive ? 'nav-item active' : 'nav-item'}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  )
}
