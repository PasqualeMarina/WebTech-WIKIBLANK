import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { registerUser } from '../api/users'
import {
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from '../../../shared/authValidation'
import styles from './LoginPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({ username: trimmedUsername, password })
      navigate(`/login?username=${encodeURIComponent(trimmedUsername)}`)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Registration failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={styles.authPage} aria-labelledby="register-title">
      <form className={styles.authCard} onSubmit={handleSubmit}>
        <div className={styles.cardHeading}>
          <p>WikiBlank</p>
          <h1 id="register-title">Register</h1>
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
              autoComplete="new-password"
            />
          </label>

          <label className={styles.field}>
            <span>Confirm password</span>
            <input
              type="password"
              placeholder="********"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryAction}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
          <Link to="/home" className={styles.guestAction}>
            Continue as guest
          </Link>
          <Link to="/login" className={styles.secondaryAction}>
            LOGIN
          </Link>
        </div>
      </form>
    </section>
  )
}
