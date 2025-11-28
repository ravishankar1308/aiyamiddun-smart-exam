import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const user = await authService.login(username, password);
        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        if ((error as any).message === 'Invalid credentials' || (error as any).message === 'Account disabled') {
            return res.status(401).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body); // Re-use the user service logic
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Registration error:', error);
        if ((error as any).message === 'Username already exists.') {
            return res.status(409).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};
