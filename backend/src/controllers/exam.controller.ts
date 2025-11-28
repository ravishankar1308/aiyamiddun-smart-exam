import { Request, Response } from 'express';
import * as examService from '../services/exam.service';

export const getAllExams = async (req: Request, res: Response) => {
    try {
        const exams = await examService.getAllExams(req.query);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createExam = async (req: Request, res: Response) => {
    try {
        const newExam = await examService.createExam(req.body);
        res.status(201).json(newExam);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam.' });
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await examService.deleteExam(id);
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting exam ${id}:`, error);
        if ((error as any).message === 'Exam not found') {
            return res.status(404).json({ error: (error as any).message });
        }
        res.status(500).json({ error: 'Failed to delete exam.' });
    }
};

export const submitExam = async (req: Request, res: Response) => {
    const { id: examId } = req.params;
    const { studentName, studentUsername, answers } = req.body;

    if (!studentUsername || !answers) {
        return res.status(400).json({ error: 'Student info and answers are required.' });
    }

    try {
        const result = await examService.submitExam(examId, studentName, studentUsername, answers);
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
        const analytics = await examService.getExamAnalytics(examId);
        res.json(analytics);
    } catch (error) {
        console.error(`Error fetching analytics for exam ${examId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
