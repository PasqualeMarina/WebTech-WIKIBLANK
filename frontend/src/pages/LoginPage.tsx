import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { loginUser } from '../api/users'
import {
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '../constants/authValidation'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState(
    () => searchParams.get('username') ?? '',
  )
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()

    setErrorMessage(null)

    if (trimmedUsername.length < MIN_USERNAME_LENGTH) {
      setErrorMessage(
        `Username must be at least ${MIN_USERNAME_LENGTH} characters long`,
      )
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      await loginUser({ username: trimmedUsername, password })
      navigate('/home')
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Login failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.authPage} aria-labelledby="login-title">
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeading}>
          <p>WikiBlank</p>
          <h1 id="login-title">Log in</h1>
        </div>

        {errorMessage ? (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Username</span>
            <input
              type="text"
              placeholder="User_name"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
          <Link to="/home" className={styles.guestAction}>
            Continue as guest
          </Link>
          <Link to="/register" className={styles.secondaryAction}>
            Create account
          </Link>
        </div>
      </form>
    </section>
  )
}
