import { db } from '../db/database.js';
import type { AuthUser, User } from './userTypes.js';

const createUserStatement = db.prepare<[string, string], AuthUser>(`
  INSERT INTO users (username, password_hash)
  VALUES (?, ?)
  RETURNING id, username
`);

const findUserByUsernameStatement = db.prepare<[string], User>(`
  SELECT id, username, password_hash, created_at
  FROM users
  WHERE username = ?
`);

const findAuthUserByIdStatement = db.prepare<[number], AuthUser>(`
  SELECT id, username
  FROM users
  WHERE id = ?
`);

export function findUserByUsername(username: string): User | null {
    return findUserByUsernameStatement.get(username) ?? null;
}

export function createUser(username: string, passwordHash: string): AuthUser | null{
    return createUserStatement.get(username, passwordHash) ?? null;
}

export function findAuthUserById(id: number): AuthUser | null {
    return findAuthUserByIdStatement.get(id) ?? null;
}
