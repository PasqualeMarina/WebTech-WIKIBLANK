import { Router } from 'express';
import { InvalidCredentialsError, UserAlreadyExistsError } from './userErrors.js';
import { getAuthenticatedUser, loginUser, registerUser } from './userService.js';
import { isValidLoginRequest, isValidRegisterRequest } from './userValidators.js';
import { requireAuth } from '../auth/authMiddleware.js';
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions,
  createAuthToken,
} from '../auth/jwtService.js';

export const userRouter = Router();

userRouter.post('/register', (req, res) => {
  if (!isValidRegisterRequest(req.body)) {
    res.status(400).json({ message: 'Invalid registration data' });
    return;
  }

  const registerData = req.body;

  try {
    const user = registerUser(registerData);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      res.status(409).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.post('/login', (req, res) => {
  if (!isValidLoginRequest(req.body)) {
    res.status(400).json({ message: 'Invalid login data' });
    return;
  }

  const loginData = req.body;

  try {
    const user = loginUser(loginData.username, loginData.password);
    const token = createAuthToken(user.id);

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.json({ message: 'User logged in successfully', user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.get('/me', requireAuth, (req, res) => {
  const user = getAuthenticatedUser(req.auth!.userId);

  if (!user) {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json({ user });
});

userRouter.post('/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
  res.json({ message: 'User logged out successfully' });
});
