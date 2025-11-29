// backend/src/routes/ai.routes.ts

import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

/**
 * @swagger
 * /ai/generate-questions:
 *   post:
 *     summary: Generate questions with AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic: { type: string }
 *               difficulty: { type: string }
 *               count: { type: integer }
 *     responses:
 *       200:
 *         description: Successfully generated questions.
 *       400:
 *         description: Bad request.
 */
router.post('/generate-questions', aiController.generateQuestionsHandler);

/**
 * @swagger
 * /ai/generate-exam-draft:
 *   post:
 *     summary: Generate an exam draft with AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic: { type: string }
 *               difficulty: { type: string }
 *               questionCount: { type: integer }
 *     responses:
 *       200:
 *         description: Successfully generated an exam draft.
 *       400:
 *         description: Bad request.
 */
router.post('/generate-exam-draft', aiController.generateExamDraftHandler);

export default router;
