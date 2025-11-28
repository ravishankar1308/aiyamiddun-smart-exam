import { connection } from '../index';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

export const login = async (username: string, password: string): Promise<string | null> => {
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
        const users = rows as User[];

        if (users.length === 0) {
            console.warn(`Login attempt failed for username: ${username}. User not found.`);
            return null;
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            console.warn(`Login attempt failed for username: ${username}. Incorrect password.`);
            return null;
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        // The jsonwebtoken library correctly handles a string like '1h' for expiration.
        // The previous explicit typing was causing the issue.
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        return token;
    } catch (error) {
        console.error('Error during login process:', error);
        throw new Error('Could not process login request.');
    }
};
