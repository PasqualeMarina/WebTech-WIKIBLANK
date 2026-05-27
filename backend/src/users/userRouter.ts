import { Router } from 'express';
import { UserAlreadyExistsError } from './userErrors.js';
import { registerUser } from './userService.js';
import { isRegisterRequest } from './userValidators.js';

export const userRouter = Router();

userRouter.post('/register', (req, res) => {
  if (!isRegisterRequest(req.body)) {
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
  // TODO: implement login logic
  res.json({ message: 'User logged in successfully' });
});
