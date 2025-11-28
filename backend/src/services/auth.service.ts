import { connection } from '../index';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

/**
 * Authenticates a user by username and password.
 * @param username - The user's username.
 * @param password - The user's plain-text password.
 * @returns A JWT token if authentication is successful; otherwise, null.
 */
export const login = async (username: string, password: string): Promise<string | null> => {
    try {
        // Find the user by username, not email
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        const users = rows as User[];

        if (users.length === 0) {
            console.warn(`Login attempt failed for username: ${username}. User not found.`);
            return null; // User not found
        }

        const user = users[0];
        // The user object from the DB has a password, so we can safely assert its presence here
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            console.warn(`Login attempt failed for username: ${username}. Incorrect password.`);
            return null; // Passwords do not match
        }

        const payload: { id: number; role: string } = {
            id: user.id,
            role: user.role,
        };

        const options: jwt.SignOptions = {
            expiresIn: JWT_EXPIRES_IN,
        };

        const token = jwt.sign(payload, JWT_SECRET, options);

        return token;
    } catch (error) {
        console.error('Error during login process:', error);
        throw new Error('Could not process login request.');
    }
};
