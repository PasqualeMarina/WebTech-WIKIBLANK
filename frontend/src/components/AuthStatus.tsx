import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../api/users'
import type { AuthUser } from '../types/user'
import styles from './AuthStatus.module.css'

export function AuthStatus() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getCurrentUser()
      .then(({ user }) => {
        if (isMounted) {
          setCurrentUser(user)
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    await logoutUser()
    setCurrentUser(null)
  }

  if (isLoading) {
    return null
  }

  if (!currentUser) {
    return (
      <div className={styles.authActions}>
        <Link to="/login" className={styles.loginButton}>
          Log in
        </Link>
        <Link to="/register" className={styles.registerButton}>
          Register
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.userStatus} aria-label="Signed in user">
      <span className={styles.userName}>{currentUser.username}</span>
      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  )
}
