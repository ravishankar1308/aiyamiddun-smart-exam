
import { findUserByUsername } from './user.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use a secure, environment-variable-driven secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret'; // Default for safety, but should be set in .env

/**
 * Authenticates a user and returns a JWT if successful.
 * @param username - The user's username.
 * @param password - The user's plain-text password.
 * @returns A promise that resolves to an object with a token and user details, or null if authentication fails.
 */
export const login = async (username: string, password: string) => {
    const user = await findUserByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        // Invalid username or password
        return null;
    }

    // Ensure the role is included in the payload
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role, // Explicitly include the user's role
    };

    // Generate a token with the user payload
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Return the token and user details (excluding the password)
    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role, // Make sure the role is in the response
        },
    };
};
