import { Router } from 'express';
import { getAllMetadata, getMetadata, updateMetadata } from '../controllers/metadata.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Anyone who is logged in can get all metadata
router.get('/', authMiddleware, getAllMetadata);

// Anyone who is logged in can get a specific metadata key
router.get('/:key', authMiddleware, getMetadata);

// Anyone who is logged in can update a metadata key. 
// The adminOrOwnerMiddleware has been removed as requested.
router.put('/:key', authMiddleware, updateMetadata);

export default router;
