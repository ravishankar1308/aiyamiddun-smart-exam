import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
    } catch (error: any) {
        console.error('Login error:', error.message);

        if (error.message.includes('disabled')) {
            // Use 403 Forbidden for disabled accounts
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'User not found' || error.message === 'Invalid password') {
            // Use 401 Unauthorized for bad credentials
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Use 500 for any other unexpected errors
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        // Check for specific, known errors from the service layer
        if (error.message === 'Username already exists.') {
            return res.status(409).json({ error: error.message }); // 409 Conflict
        }
        // For other validation-type errors (e.g., missing fields)
        res.status(400).json({ error: error.message });
    }
};
