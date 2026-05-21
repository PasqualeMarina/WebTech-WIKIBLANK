import { Link } from 'react-router-dom'
import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <section className={styles.loginPage} aria-labelledby="login-title">
      <form className={styles.loginCard}>
        <div className={styles.cardHeading}>
          <p>WikiBlank</p>
          <h1 id="login-title">Log in</h1>
        </div>

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Username</span>
            <input type="text" placeholder="User_name" />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input type="password" placeholder="********" />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryAction}>
            Log in
          </button>
          <Link to="/home" className={styles.guestAction}>
            Continue as guest
          </Link>
        </div>
      </form>
    </section>
  )
}
