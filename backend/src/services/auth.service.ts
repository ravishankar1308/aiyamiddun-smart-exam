import { connection } from '../database';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string | number = 3600;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

// Update the return type to include the user object
export const login = async (username: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> } | null> => {
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

        // Remove password from user object before sending it to the client
        const { password: _, ...userProfile } = user;

        const payload = {
            id: user.id,
            role: user.role,
        };

        const options: jwt.SignOptions = {
            expiresIn: JWT_EXPIRES_IN,
        };

        const token = jwt.sign(payload, JWT_SECRET, options);

        // Return both the token and the user profile
        return { token, user: userProfile };

    } catch (error) {
        console.error('Error during login process:', error);
        throw new Error('Could not process login request.');
    }
};
