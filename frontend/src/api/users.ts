import { apiClient } from './client'
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from '../../../shared/users'

export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/users/register', data)
  return response.data
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/users/login', data)
  return response.data
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await apiClient.get<CurrentUserResponse>('/users/me')
  return response.data
}

export async function logoutUser(): Promise<LogoutResponse> {
  const response = await apiClient.post<LogoutResponse>('/users/logout')
  return response.data
}
