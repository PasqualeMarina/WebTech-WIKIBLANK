import { AuthStatus } from './AuthStatus'
import styles from './PageHeader.module.css'

type PageHeaderProps = {
  title: string
  titleId: string
}

export function PageHeader({ title, titleId }: PageHeaderProps) {
  return (
    <header className={styles.homeHeader}>
      <div>
        <p className={styles.eyebrow}>WikiBlank</p>
        <h1 id={titleId}>{title}</h1>
      </div>
      <div className={styles.authSlot}>
        <AuthStatus />
      </div>
    </header>
  )
}
