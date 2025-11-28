
import { Router } from 'express';
import * as resultsController from '../controllers/results.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes for this resource
router.use(authMiddleware);

// GET /api/results - Fetches all exam results
router.get('/', resultsController.getAllResults);

export default router;
