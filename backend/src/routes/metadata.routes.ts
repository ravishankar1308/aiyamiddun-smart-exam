
import { Router } from 'express';
import { getAllMetadata, getMetadata, updateMetadata } from '../controllers/metadata.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public route to get all metadata, useful for general info
router.get('/all', getAllMetadata);

// Route to get a specific metadata key, e.g., /api/metadata/grades
// Protected so only logged-in users can access metadata
router.get('/:key', protect, getMetadata);

// Route to update a metadata key
// Restricted to admins and owners to prevent unauthorized changes
router.put('/:key', protect, authorize('admin', 'owner'), updateMetadata);

export default router;
