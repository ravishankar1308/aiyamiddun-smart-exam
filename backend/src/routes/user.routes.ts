import { Router } from 'express';
import { getAllUsers, createUser, updateUser, toggleUserStatus, deleteUser } from '../controllers/user.controller';

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-disable', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
