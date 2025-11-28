
import { Request, Response } from 'express';
import * as resultsService from '../services/results.service';

/**
 * @description Get all exam results, potentially filtered by user role.
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 */
export const getAllResults = async (req: Request, res: Response) => {
    try {
        // The user object is attached to the request by the `protect` middleware
        const user = (req as any).user;

        // The service will handle the logic of fetching based on the user's role
        const results = await resultsService.getAllResults(user);

        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to retrieve exam results.' });
    }
};
