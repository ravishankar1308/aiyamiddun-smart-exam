import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
    // Expect 'username' from the request body, not 'email'
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const token = await authService.login(username, password);

        if (token) {
            res.json({ token });
        } else {
            // Use a more generic error message for security
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        // Log the detailed error on the server but send a generic message to the client
        console.error('Login error:', (error as Error).message);
        res.status(500).json({ error: 'Could not process login request.' });
    }
};
