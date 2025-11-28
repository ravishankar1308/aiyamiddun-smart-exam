
import * as jwt from 'jsonwebtoken';
import { connection } from '../index'; // Use the exported connection from index.ts
import { RowDataPacket } from 'mysql2';

// This should be in an environment variable in a real application!
const JWT_SECRET = 'your-super-secret-and-long-key-that-is-at-least-32-characters';
const JWT_EXPIRES_IN = '1h'; // Token expiration time

// Define a type for our user data from the database
interface User extends RowDataPacket {
    id: number;
    username: string;
    password: string; // This is insecure!
    role: string;
}

/**
 * Validates user credentials and generates a JWT if they are correct.
 * @param username - The user's username.
 * @param password - The user's plain text password.
 * @returns An object with the token and expiration if successful, otherwise null.
 */
export const login = async (username: string, password: string) => {
    try {
        // 1. Find the user by username using the correct 'mysql2' placeholder (?)
        const [userRows] = await connection.query<User[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (userRows.length === 0) {
            console.log(`Login attempt failed: No user found for username ${username}`);
            return null; // User not found
        }

        const user = userRows[0];

        // 2. Check the password (insecure plain text comparison)
        if (user.password !== password) {
            console.log(`Login attempt failed: Incorrect password for username ${username}`);
            return null; // Passwords do not match
        }

        // 3. If password is correct, create the JWT payload
        const payload = {
            id: user.id,
            role: user.role,
        };

        // 4. Sign the JWT
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        console.log(`User ${username} logged in successfully.`);

        // 5. Return the token and expiration information
        return {
            token,
            expiresIn: JWT_EXPIRES_IN,
        };
    } catch (error) {
        console.error('Error during login service execution:', error);
        return null;
    }
};
