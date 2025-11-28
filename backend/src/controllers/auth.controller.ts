
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * Handles the user login request.
 * Expects 'email' (or 'username') and 'password' in the request body.
 */
export const login = async (req: Request, res: Response) => {
    // Allow login with either 'email' or 'username' for flexibility
    const { email: bodyEmail, username, password } = req.body;
    const email = bodyEmail || username;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email (or username) and password are required.' });
    }

    try {
        // Call the authentication service to validate credentials and get a token
        const result = await authService.login(email, password);

        if (!result) {
            // Use a generic message to avoid revealing which field was incorrect
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Send the token back to the client
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};
