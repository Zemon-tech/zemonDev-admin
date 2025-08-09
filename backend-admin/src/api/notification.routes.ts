import express from 'express';
import {
  getUserNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  createCustomNotification,
  createBulkNotifications,
  cleanupExpiredNotifications,
  getAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';
import { checkRole } from '../middleware/auth.middleware';

const router = express.Router();

// User routes (require authentication)
// @ts-ignore
router.get('/', ...protect, getUserNotifications);
// @ts-ignore
router.get('/stats', ...protect, getNotificationStats);
// @ts-ignore
router.get('/preferences', ...protect, getNotificationPreferences);
// @ts-ignore
router.put('/preferences', ...protect, updateNotificationPreferences);
// @ts-ignore
router.put('/:id/read', ...protect, markNotificationAsRead);
// @ts-ignore
router.put('/read-all', ...protect, markAllNotificationsAsRead);
// @ts-ignore
router.put('/:id/archive', ...protect, archiveNotification);
// @ts-ignore
router.delete('/:id', ...protect, deleteNotification);

// Admin routes (require admin role)
// @ts-ignore
router.get('/all', ...protect, checkRole(['admin']), getAllNotifications);
// @ts-ignore
router.post('/custom', ...protect, checkRole(['admin']), createCustomNotification);
// @ts-ignore
router.post('/bulk', ...protect, checkRole(['admin']), createBulkNotifications);
// @ts-ignore
router.delete('/cleanup', ...protect, checkRole(['admin']), cleanupExpiredNotifications);

export default router;

