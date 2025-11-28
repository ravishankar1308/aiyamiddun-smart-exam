
import { Router } from 'express';
import * as resultsController from '../controllers/results.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes for this resource
router.use(protect);

// GET /api/results - Fetches all exam results
router.get('/', resultsController.getAllResults);

export default router;
