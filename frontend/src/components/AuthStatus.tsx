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
      <button type="button" className={styles.loginButton}>
        Log in
      </button>
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
