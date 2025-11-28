import { connection } from '../index';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.service';

// Use an environment variable for the JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Default to 1 hour

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

/**
 * Authenticates a user by email and password.
 * @param email - The user's email.
 * @param password - The user's plain-text password.
 * @returns A JWT token if authentication is successful; otherwise, null.
 */
export const login = async (email: string, password: string): Promise<string | null> => {
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as User[];

        if (users.length === 0) {
            console.warn(`Login attempt failed for email: ${email}. User not found.`);
            return null; // User not found
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.warn(`Login attempt failed for email: ${email}. Incorrect password.`);
            return null; // Passwords do not match
        }

        // User is authenticated, create JWT
        const payload = {
            id: user.id,
            role: user.role, // Ensure the role is included in the payload
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return token;
    } catch (error) {
        console.error('Error during login process:', error);
        // It's generally better to throw and let the controller handle the HTTP response.
        throw new Error('Could not process login request.');
    }
};
