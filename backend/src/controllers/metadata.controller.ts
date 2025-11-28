import { Request, Response } from 'express';
import * as metadataService from '../services/metadata.service';

export const getMetadata = async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) {
        return res.status(400).json({ error: 'A metadata key is required.' });
    }

    try {
        const metadataResult = await metadataService.getMetadata(key);
        if (metadataResult) {
            // The service might return the full prisma object {id, key, value}
            // or it might return the raw default value (e.g., an array).
            // The frontend expects an object with a `value` property which holds the data array.
            // We ensure the response always has this structure.
            const value = metadataResult.value !== undefined ? metadataResult.value : metadataResult;
            res.json({ key, value });
        } else {
            // This case might not be reachable if the service always provides a default
            res.status(404).json({ error: `Metadata with key '${key}' not found.` });
        }
    } catch (error) {
        console.error(`Error fetching metadata for key '${key}':`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateMetadata = async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value } = req.body;

    if (!key) {
        return res.status(400).json({ error: 'A metadata key is required.' });
    }
    if (value === undefined) {
        return res.status(400).json({ error: 'A value is required to update metadata.' });
    }

    try {
        const updatedMetadata = await metadataService.updateMetadata(key, value);
        res.json(updatedMetadata);
    } catch (error) {
        console.error(`Error updating metadata for key '${key}':`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
