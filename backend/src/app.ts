import express from 'express';
import session from 'express-session';
import { userRouter } from './users/userRouter.js';

export const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET ?? 'wikblank-dev-session-secret';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}

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
