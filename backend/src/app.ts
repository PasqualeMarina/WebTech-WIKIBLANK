import express from 'express';
import type { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { userRouter } from './users/userRouter.js';
import { gameRouter } from './games/gameRouter.js';
import cors from 'cors';
import { authenticateJwt } from './auth/authMiddleware.js';

export const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(authenticateJwt);
app.use('/api/users', userRouter);

const jsonParseErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  next(error);
};

app.use(jsonParseErrorHandler);

app.use('/api/games', gameRouter);
