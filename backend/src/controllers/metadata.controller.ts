import { Request, Response } from 'express';
import * as metadataService from '../services/metadata.service';

export const getMetadata = async (req: Request, res: Response) => {
    try {
        const metadata = await metadataService.getMetadata();
        res.json(metadata);
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
