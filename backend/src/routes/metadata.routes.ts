import { Router } from 'express';
import { getMetadata, updateMetadata } from '../controllers/metadata.controller';
import { authMiddleware, adminOrOwnerMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Route to get a specific piece of metadata (e.g., /api/metadata/grades)
// All authenticated users can read metadata.
router.get('/:key', authMiddleware, getMetadata);

// Route to update a specific piece of metadata
// Only admins or owners can update metadata.
router.put('/:key', authMiddleware, adminOrOwnerMiddleware, updateMetadata);

export default router;
