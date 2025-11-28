import { Router } from 'express';
import {
    getAllQuestions,
    createQuestion,
    updateQuestion,
    updateQuestionStatus,
    toggleQuestionDisable,
    deleteQuestion
} from '../controllers/question.controller';

const router = Router();

router.get('/', getAllQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.patch('/:id/status', updateQuestionStatus);
router.patch('/:id/toggle-disable', toggleQuestionDisable);
router.delete('/:id', deleteQuestion);

export default router;
