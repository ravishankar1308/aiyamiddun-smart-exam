// backend/src/controllers/ai.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/ai.service';

/**
 * Controller to handle AI-based question generation.
 */
export const generateQuestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topic, difficulty, count } = req.body;

        if (!topic || !difficulty || !count) {
            return res.status(400).json({ error: 'Topic, difficulty, and count are required.' });
        }

        const questions = await aiService.generateQuestions(topic, difficulty, parseInt(count));
        
        res.status(200).json(questions);

    } catch (error) {
        next(error); // Pass errors to the centralized error handler
    }
};
