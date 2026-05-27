import { db } from '../db/database.js';
import type { AuthUser } from './userTypes.js';

const createUserStatement = db.prepare<[string, string], AuthUser>(`
  INSERT INTO users (username, password_hash)
  VALUES (?, ?)
  RETURNING id, username
`);

export function createUser(username: string, passwordHash: string): AuthUser | null{
    return createUserStatement.get(username, passwordHash) ?? null;
}
