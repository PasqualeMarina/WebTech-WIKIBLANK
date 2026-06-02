export type AuthUser = {
  id: number
  username: string
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = LoginRequest

export type AuthResponse = {
  message: string
  user: AuthUser
}

export type CurrentUserResponse = {
  user: AuthUser
}

export type LogoutResponse = {
  message: string
}
