import { connection } from '../index';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from './user.service';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = 3600;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
}

export const login = async (email: string, password: string): Promise<string | null> => {
    try {
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as User[];

        if (users.length === 0) {
            console.warn(`Login attempt failed for email: ${email}. User not found.`);
            return null;
        }

        const user = users[0];
        // The user object from the DB has a password, so we can safely assert its presence here
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            console.warn(`Login attempt failed for email: ${email}. Incorrect password.`);
            return null;
        }

        // Define the payload with an explicit type
        const payload: { id: number; role: string } = {
            id: user.id,
            role: user.role,
        };

        // Explicitly type the options to avoid ambiguity
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
