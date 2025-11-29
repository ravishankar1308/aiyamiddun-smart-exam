
import { Router } from 'express';
import { getAllMetadata, getMetadata, updateMetadata } from '../controllers/metadata.controller';
import { authMiddleware, adminOrOwnerMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to get all metadata, useful for general info
router.get('/all', getAllMetadata);

// Route to get a specific metadata key, e.g., /api/metadata/grades
// Protected so only logged-in users can access metadata
router.get('/:key', authMiddleware, getMetadata);

// Route to update a metadata key
// Restricted to admins and owners to prevent unauthorized changes
router.put('/:key', authMiddleware, adminOrOwnerMiddleware, updateMetadata);

export default router;
