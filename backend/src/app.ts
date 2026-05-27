import express from 'express';
import { userRouter } from './users/userRouter.js';

export const app = express();

app.use(express.json());
app.use('/api/users', userRouter);