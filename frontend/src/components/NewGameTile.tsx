import styles from './NewGameTile.module.css'

type NewGameTileProps = {
  title: string
  subtitle?: string
  variant?: 'quick' | 'category'
  onClick?: () => void
}

export function NewGameTile({
  title,
  subtitle,
  variant = 'quick',
  onClick,
}: NewGameTileProps) {
  const className = [
    styles.newGameTile,
    variant === 'category' ? styles.category : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={className} onClick={onClick}>
      <span className={styles.title}>{title}</span>
      {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
    </button>
  )
}
