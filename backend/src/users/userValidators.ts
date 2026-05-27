import type { LoginRequest, RegisterRequest } from './userTypes.js';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

function isCredentialsRequest(body: unknown): body is LoginRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'username' in body &&
    'password' in body &&
    typeof body.username === 'string' &&
    typeof body.password === 'string' &&
    body.username.trim().length >= MIN_USERNAME_LENGTH &&
    body.password.length >= MIN_PASSWORD_LENGTH
  );
}

export function isValidRegisterRequest(body: unknown): body is RegisterRequest {
  return isCredentialsRequest(body);
}

export function isValidLoginRequest(body: unknown): body is LoginRequest {
  return isCredentialsRequest(body);
}
