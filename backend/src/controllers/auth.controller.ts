
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

/**
 * Handles the user login request.
 * Expects 'username' and 'password' in the request body.
 */
export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const result = await authService.login(username, password);

        if (!result) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};

/**
 * Handles the user registration request.
 * Expects 'name', 'username', 'password', and 'role' in the request body.
 */
export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.message === 'Username already exists.') {
            return res.status(409).json({ error: error.message });
        }
        if (error.message === 'All user fields are required.') {
            return res.status(400).json({ error: error.message });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration.' });
    }
};
