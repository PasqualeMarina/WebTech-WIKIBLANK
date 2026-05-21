import { Link } from 'react-router-dom'
import styles from './LoginPage.module.css'

export function RegisterPage() {
  return (
    <section className={styles.authPage} aria-labelledby="register-title">
      <form className={styles.authCard}>
        <div className={styles.cardHeading}>
          <p>WikiBlank</p>
          <h1 id="register-title">Register</h1>
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

          <label className={styles.field}>
            <span>Confirm password</span>
            <input type="password" placeholder="********" />
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryAction}>
            Register
          </button>
          <Link to="/home" className={styles.guestAction}>
            Continue as guest
          </Link>
          <Link to="/login" className={styles.secondaryAction}>
            Back to login
          </Link>
        </div>
      </form>
    </section>
  )
}
