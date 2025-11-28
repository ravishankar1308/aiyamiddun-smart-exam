import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // The service now returns an object with the token and user profile
        const loginResult = await authService.login(username, password);

        if (loginResult) {
            // Send both the token and the user profile to the client
            res.json(loginResult);
        } else {
            res.status(401).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Login error:', (error as Error).message);
        res.status(500).json({ error: 'Could not process login request.' });
    }
};
