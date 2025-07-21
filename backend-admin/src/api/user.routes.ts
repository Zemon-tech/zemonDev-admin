import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, getCurrentUser } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/users - Get all users
// @ts-ignore
router.get('/', ...protect, getUsers);
// GET /api/users/me - Get current user
// @ts-ignore
router.get('/me', ...protect, getCurrentUser);
// GET /api/users/:id - Get user by ID
// @ts-ignore
router.get('/:id', ...protect, getUserById);
// PUT /api/users/:id - Update user
// @ts-ignore
router.put('/:id', ...protect, updateUser);
// DELETE /api/users/:id - Delete user
// @ts-ignore
router.delete('/:id', ...protect, deleteUser);

export default router;