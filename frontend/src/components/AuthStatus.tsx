import { Link } from 'react-router-dom'
import styles from './AuthStatus.module.css'

type AuthUser = {
  name: string
}

function getCurrentUser(): AuthUser | null {
  return null
}

export function AuthStatus() {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    return (
      <Link to="/login" className={styles.loginButton}>
        Log in
      </Link>
    )
  }

  return (
    <div className={styles.userStatus} aria-label="Signed in user">
      <span className={styles.userName}>{currentUser.name}</span>
      <button type="button" className={styles.logoutButton}>
        Log out
      </button>
    </div>
  )
}
