import express from 'express';
import type { ErrorRequestHandler } from 'express';
import session from 'express-session';
import { userRouter } from './users/userRouter.js';
import { gameRouter } from './games/gameRouter.js';
import cors from 'cors';

export const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET ?? 'wikblank-dev-session-secret';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: 'wikblank.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 4,
    },
  }),
);
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
