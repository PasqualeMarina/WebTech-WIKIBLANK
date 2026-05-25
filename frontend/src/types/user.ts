export type User = {
  id: number
  username: string
}

export type AuthUser = User

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  username: string
  password: string
}
