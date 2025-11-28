import { Router } from 'express';
import { generateQuestion } from '../controllers/ai.controller';

const router = Router();

router.post('/generate-question', generateQuestion);

export default router;
