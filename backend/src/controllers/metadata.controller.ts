import { Request, Response } from 'express';
import * as metadataService from '../services/metadata.service';

export const getAllMetadata = async (req: Request, res: Response) => {
    try {
        const allMetadata = await metadataService.getAllMetadata();
        res.json(allMetadata);
    } catch (error) {
        console.error('Error fetching all metadata:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMetadata = async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) {
        return res.status(400).json({ error: 'A metadata key is required.' });
    }

    try {
        const metadataValue = await metadataService.getMetadata(key);
        // The frontend API client expects the data to be wrapped in a 'value' property.
        res.json({ value: metadataValue });
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
        // The frontend API client also expects the updated data to be wrapped in a 'value' property.
        res.json({ value: updatedMetadata.value });
    } catch (error) {
        console.error(`Error updating metadata for key '${key}':`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
