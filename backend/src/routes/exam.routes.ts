import { Router } from 'express';
import {
    getAllExams,
    createExam,
    deleteExam,
    submitExam,
    getExamAnalytics
} from '../controllers/exam.controller';

const router = Router();

router.get('/', getAllExams);
router.post('/', createExam);
router.delete('/:id', deleteExam);
router.post('/:id/submit', submitExam);
router.get('/:id/analytics', getExamAnalytics);

export default router;
