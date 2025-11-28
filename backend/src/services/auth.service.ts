
import * as jwt from 'jsonwebtoken';
import { pool } from '../config/database'; // Assuming you have a database configuration

// This should be in an environment variable in a real application!
const JWT_SECRET = 'your-super-secret-and-long-key-that-is-at-least-32-characters';
const JWT_EXPIRES_IN = '1h'; // Token expiration time

/**
 * Validates user credentials and generates a JWT if they are correct.
 * NOTE: This is an insecure implementation that checks passwords in plain text.
 * @param email - The user's email.
 * @param password - The user's plain text password.
 * @returns An object with the token and expiration if successful, otherwise null.
 */
export const login = async (email: string, password: string) => {
    // 1. Find the user by email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
        console.log(`Login attempt failed: No user found for email ${email}`);
        return null; // User not found
    }

    const user = userResult.rows[0];

        // 2. Check the password (insecure plain text comparison)
        if (user.password !== password) {
            console.log(`Login attempt failed: Incorrect password for email ${email}`);
            return null; // Passwords do not match
        }

        // 3. If password is correct, create the JWT payload
        const payload = {
            id: user.id,
            role: user.role, // Assuming your 'users' table has a 'role' column
        };

        // 4. Sign the JWT
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        console.log(`User ${email} logged in successfully.`);

        // 5. Return the token and expiration information
        return {
            token,
            expiresIn: JWT_EXPIRES_IN,
        };
    } catch (error) {
        console.error('Error during login service execution:', error);
        // In case of a database error or other unexpected issue, prevent login
        return null;
    }
};
