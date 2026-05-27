import { hashPassword } from '../auth/passwordService.js';
import { UserAlreadyExistsError } from './userErrors.js';
import { createUser } from './userRepository.js';
import type { AuthUser, RegisterRequest } from './userTypes.js';

function isUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'SQLITE_CONSTRAINT_UNIQUE'
    );
}

export function registerUser(registerData: RegisterRequest): AuthUser {
    try{
        const passwordHash = hashPassword(registerData.password);
        const user = createUser(registerData.username, passwordHash);
        if (!user) {
            throw new Error('Failed to register user');
        }
        return user;
    }
    catch (error) {
        if (isUniqueConstraintError(error)) {
            throw new UserAlreadyExistsError();
        }

        throw new Error('Failed to register user', { cause: error });
    }
}
