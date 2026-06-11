import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import styles from './AuthStatus.module.css'
import { useNavigate } from 'react-router-dom'

export function AuthStatus() {
  const { currentUser, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/home', { replace: true })
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
      <span className={styles.userName}>
        <span className={styles.userAvatar} aria-hidden="true">
          {currentUser.username.charAt(0).toUpperCase()}
        </span>
        {currentUser.username}
      </span>
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
