import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';

export const generateQuestion = async (req: Request, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const generatedContent = await aiService.generateQuestion(prompt);
        res.json(generatedContent);
    } catch (error) {
        console.error('Error calling generative AI:', error);
        res.status(500).json({ error: 'Failed to generate content' });
    }
};
