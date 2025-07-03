import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router; 