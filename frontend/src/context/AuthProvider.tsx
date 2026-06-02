import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from '../api/users'
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from '../../../shared/users'
import { AuthContext } from './authContext'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshCurrentUser() {
    try {
      const { user } = await getCurrentUser()
      setCurrentUser(user)
    } catch {
      setCurrentUser(null)
    }
  }

  async function login(credentials: LoginRequest): Promise<AuthResponse> {
    const authResponse = await loginUser(credentials)
    setCurrentUser(authResponse.user)
    return authResponse
  }

  async function logout() {
    try {
      await logoutUser()
    } finally {
      setCurrentUser(null)
    }
  }

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

  const value = useMemo(
    () => ({
      currentUser,
      isLoading,
      login,
      logout,
      refreshCurrentUser,
    }),
    [currentUser, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
