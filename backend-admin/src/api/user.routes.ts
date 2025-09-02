import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, getCurrentUser, getUserScoringController, getUserDashboardController, getUserInsightsController, getNextUpController, recomputeUserAnalyticsController, setActiveGoalController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/users - Get all users
// @ts-ignore
router.get('/', ...protect, getUsers);
// GET /api/users/me - Get current user
// @ts-ignore
router.get('/me', ...protect, getCurrentUser);
// GET /api/users/me/scoring - Get scoring summary
// @ts-ignore
router.get('/me/scoring', ...protect, getUserScoringController);
// GET /api/users/me/dashboard - Get dashboard summary
// @ts-ignore
router.get('/me/dashboard', ...protect, getUserDashboardController);
// GET /api/users/me/insights - Get deep analytics
// @ts-ignore
router.get('/me/insights', ...protect, getUserInsightsController);
// GET /api/users/me/next-up - Next-up recommendation
// @ts-ignore
router.get('/me/next-up', ...protect, getNextUpController);
// POST /api/users/me/recompute-analytics - Recompute
// @ts-ignore
router.post('/me/recompute-analytics', ...protect, recomputeUserAnalyticsController);
// POST /api/users/me/goal - Set active goal
// @ts-ignore
router.post('/me/goal', ...protect, setActiveGoalController);
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