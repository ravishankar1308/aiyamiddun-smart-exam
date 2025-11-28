import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        if ((error as any).message === 'Username already exists.') {
            return res.status(409).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to create user.' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await userService.updateUser(id, req.body);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        if ((error as any).message === 'Username already exists.') {
            return res.status(409).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to update user.' });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const message = await userService.toggleUserStatus(id);
        res.json({ message });
    } catch (error) {
        console.error(`Error toggling user ${id} status:`, error);
        if ((error as any).message === 'User not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to update user status.' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await userService.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        if ((error as any).message === 'User not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to delete user.' });
    }
};
