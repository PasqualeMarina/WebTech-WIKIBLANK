import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET ?? 'wikblank-dev-jwt-secret';

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'wikblank-api';
const JWT_AUDIENCE = 'wikblank-spa';
const JWT_EXPIRATION_SECONDS = 60 * 60 * 4;

export const AUTH_COOKIE_NAME = 'wikblank.auth';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

export type AuthTokenPayload = {
  userId: number;
};

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
  maxAge: JWT_EXPIRATION_SECONDS * 1000,
};

export const clearAuthCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

export function createAuthToken(userId: number): string {
  return jwt.sign({}, jwtSecret, {
    algorithm: JWT_ALGORITHM,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_EXPIRATION_SECONDS,
    issuer: JWT_ISSUER,
    subject: String(userId),
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: [JWT_ALGORITHM],
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });

    if (
      typeof payload === 'string'
      || typeof payload.sub !== 'string'
      || !/^[1-9]\d*$/.test(payload.sub)
    ) {
      return null;
    }

    return { userId: Number(payload.sub) };
  } catch {
    return null;
  }
}
