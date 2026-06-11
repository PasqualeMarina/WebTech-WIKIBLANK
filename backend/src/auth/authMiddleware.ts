import type { Request, RequestHandler } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken } from './jwtService.js';

function getAuthCookie(req: Request): string | null {
  const cookies = req.cookies as unknown;

  if (typeof cookies !== 'object' || cookies === null) {
    return null;
  }

  const token = (cookies as Record<string, unknown>)[AUTH_COOKIE_NAME];
  return typeof token === 'string' ? token : null;
}

export const authenticateJwt: RequestHandler = (req, _res, next) => {
  const token = getAuthCookie(req);

  if (token) {
    const auth = verifyAuthToken(token);

    if (auth) {
      req.auth = auth;
    }
  }

  next();
};

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
};
