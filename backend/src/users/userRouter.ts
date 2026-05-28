import { Router } from 'express';
import { InvalidCredentialsError, UserAlreadyExistsError } from './userErrors.js';
import { getAuthenticatedUser, loginUser, registerUser } from './userService.js';
import { isValidLoginRequest, isValidRegisterRequest } from './userValidators.js';

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
    req.session.userId = user.id;
    res.json({ message: 'User logged in successfully', user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

userRouter.get('/me', (req, res) => {
  if (req.session.userId === undefined) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = getAuthenticatedUser(req.session.userId);

  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  res.json({ user });
});

userRouter.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    res.clearCookie('wikblank.sid');
    res.json({ message: 'User logged out successfully' });
  });
});
