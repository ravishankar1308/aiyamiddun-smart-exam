import { Router } from 'express';
import {
    getAllExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    submitExam,
    getExamAnalytics
} from '../controllers/exam.controller';

const router = Router();

router.get('/', getAllExams);
router.post('/', createExam);

router.get('/:id', getExamById);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

router.post('/:id/submit', submitExam);
router.get('/:id/analytics', getExamAnalytics);

export default router;
