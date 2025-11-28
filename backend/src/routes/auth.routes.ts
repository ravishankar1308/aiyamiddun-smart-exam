import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

// Route for user login
// POST /api/auth/login
router.post('/login', login);

// Route for user registration
// POST /api/auth/register
router.post('/register', register);

export default router;
