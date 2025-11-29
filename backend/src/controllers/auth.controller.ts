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

export const register = async (req: Request, res: Response) => {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
        return res.status(400).json({ error: 'Name, username, password, and role are required.' });
    }

    try {
        const newUser = await authService.register(name, username, password, role);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', (error as Error).message);
        // Check for specific error messages from the service
        if ((error as Error).message === 'Username already exists.') {
            return res.status(409).json({ error: (error as Error).message });
        }
        res.status(500).json({ error: 'Could not process registration request.' });
    }
};
