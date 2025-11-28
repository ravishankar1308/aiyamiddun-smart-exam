import { Router } from 'express';
import { getAllMetadata, getMetadata, updateMetadata } from '../controllers/metadata.controller';
import { authMiddleware, adminOrOwnerMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getAllMetadata);

router.get('/:key', authMiddleware, getMetadata);

router.put('/:key', authMiddleware, adminOrOwnerMiddleware, updateMetadata);

export default router;
