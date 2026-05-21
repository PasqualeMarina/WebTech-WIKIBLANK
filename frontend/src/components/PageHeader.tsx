import styles from './PageHeader.module.css'

type PageHeaderProps = {
  title: string
  titleId: string
}

export function PageHeader({ title, titleId }: PageHeaderProps) {
  return (
    <header className={styles.homeHeader}>
      <p className={styles.eyebrow}>WikiBlank</p>
      <h1 id={titleId}>{title}</h1>
    </header>
  )
}
