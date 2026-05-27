export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = LoginRequest;

export type User = {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
};

export type AuthUser = {
  id: number;
  username: string;
};
