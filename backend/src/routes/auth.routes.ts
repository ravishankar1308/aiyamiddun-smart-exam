import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

// Route for user login
// POST /api/auth/login
router.post('/login', login);

// The register route was removed temporarily to fix a compilation error.
// We can add the full registration functionality next.

export default router;
