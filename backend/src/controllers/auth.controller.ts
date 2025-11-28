import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // The 'result' from the service now correctly contains { token, user: { ... } }
        // The controller's only job is to send that result as the response.
        res.json(result);

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
