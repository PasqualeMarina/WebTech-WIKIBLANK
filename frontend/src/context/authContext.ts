import { createContext, useContext } from 'react'
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from '../../../shared/users'

export type AuthContextValue = {
  currentUser: AuthUser | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const authContext = useContext(AuthContext)

  if (!authContext) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return authContext
}
