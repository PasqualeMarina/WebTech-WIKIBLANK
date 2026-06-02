export type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../../../shared/users.js';

export type User = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};
