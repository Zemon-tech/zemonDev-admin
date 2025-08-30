import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/auth.middleware';

const router = express.Router();

// Dashboard routes (require admin authentication)
router.use(protect as any);
router.use(checkRole(['admin']));

// GET /api/dashboard/stats - Get comprehensive dashboard statistics
router.get('/stats', getDashboardStats);

export default router;
