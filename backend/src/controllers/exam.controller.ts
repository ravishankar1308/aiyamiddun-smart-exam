import { Request, Response } from 'express';
import * as examService from '../services/exam.service';
import { AuthenticatedRequest } from '../types/express';

export const getAllExams = async (req: Request, res: Response) => {
    try {
        const exams = await examService.getAllExams(req.query);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getExamById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const exam = await examService.getExamById(parseInt(id));
        res.json(exam);
    } catch (error) {
        console.error(`Error fetching exam ${id}:`, error);
        if ((error as any).message === 'Exam not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createExam = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const newExam = await examService.createExam(req.body, req.user);
        res.status(201).json(newExam);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam.' });
    }
};

export const updateExam = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedExam = await examService.updateExam(parseInt(id), req.body);
        res.json(updatedExam);
    } catch (error) {
        console.error(`Error updating exam ${id}:`, error);
        if ((error as any).message.includes('not found')) {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to update exam.' });
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await examService.deleteExam(parseInt(id));
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting exam ${id}:`, error);
        if ((error as any).message === 'Exam not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to delete exam.' });
    }
};

export const submitExam = async (req: AuthenticatedRequest, res: Response) => {
    const { id: examId } = req.params;
    const { answers } = req.body;

    if (!req.user || !answers) {
        return res.status(400).json({ error: 'User and answers are required.' });
    }

    try {
        const result = await examService.submitExam(parseInt(examId), req.user.id, answers);
        res.status(201).json(result);
    } catch (error) {
        console.error(`Error submitting exam ${examId}:`, error);
        if ((error as any).message === 'Exam not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to submit exam.' });
    }
};

export const getExamAnalytics = async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    try {
        const analytics = await examService.getExamAnalytics(parseInt(examId));
        res.json(analytics);
    } catch (error) {
        console.error(`Error fetching analytics for exam ${examId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
