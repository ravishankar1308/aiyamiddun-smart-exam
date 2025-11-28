import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// Route for user login
// POST /api/auth/login
router.post('/login', login);

export default router;
