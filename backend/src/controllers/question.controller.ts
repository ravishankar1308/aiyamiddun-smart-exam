import { Request, Response } from 'express';
import * as questionService from '../services/question.service';
import { AuthenticatedRequest } from '../types/express';

export const getAllQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await questionService.getAllQuestions(req.query);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createQuestion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const newQuestion = await questionService.createQuestion(req.body, req.user);
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question.' });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await questionService.updateQuestion(parseInt(id), req.body);
        res.json({ message: 'Question updated successfully' });
    } catch (error) {
        console.error(`Error updating question ${id}:`, error);
        res.status(500).json({ error: 'Failed to update question.' });
    }
};

export const updateQuestionStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const message = await questionService.updateQuestionStatus(parseInt(id), status);
        res.json({ message });
    } catch (error) {
        console.error(`Error updating question ${id} status:', error);
        if ((error as any).message === 'Invalid status') {
            return res.status(400).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to update status.' });
    }
};

export const toggleQuestionDisable = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const message = await questionService.toggleQuestionDisable(parseInt(id));
        res.json({ message });
    } catch (error) {
        console.error(`Error toggling question ${id} status:', error);
        if ((error as any).message === 'Question not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to update status.' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await questionService.deleteQuestion(parseInt(id));
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting question ${id}:`, error);
        if ((error as any).message === 'Question not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to delete question.' });
    }
};
