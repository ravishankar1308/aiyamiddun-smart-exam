
import { findUserByUsername } from './user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-super-secret-and-long-key-that-is-at-least-32-characters';

export const login = async (username: string, password: string) => {
    const user = await findUserByUsername(username);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if the user account is disabled
    if (user.disabled) {
        throw new Error('Your account has been disabled. Please contact an administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Important: Do not send the password back to the client
    const { password: _, ...userWithoutPassword } = user;

    return {
        token,
        user: userWithoutPassword,
    };
};
