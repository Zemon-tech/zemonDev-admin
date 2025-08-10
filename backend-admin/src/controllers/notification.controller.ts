import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { NotificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;
  const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
  const priority = req.query.priority as string;

  const filters = {
    page,
    limit,
    type,
    isRead,
    priority,
  };

  const result = await NotificationService.getUserNotifications(req.user._id, filters);

  res.json({
    success: true,
    data: result,
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const stats = await NotificationService.getNotificationStats(req.user._id);

  res.json({
    success: true,
    data: stats,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid notification ID', 400));
  }

  const notification = await NotificationService.markNotificationAsRead(
    new mongoose.Types.ObjectId(id),
    req.user._id
  );

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const result = await NotificationService.markAllNotificationsAsRead(req.user._id);

  res.json({
    success: true,
    data: result,
  });
});

// @desc    Archive notification
// @route   PUT /api/notifications/:id/archive
// @access  Private
export const archiveNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid notification ID', 400));
  }

  const notification = await NotificationService.archiveNotification(
    new mongoose.Types.ObjectId(id),
    req.user._id
  );

  res.json({
    success: true,
    data: notification,
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid notification ID', 400));
  }

  await NotificationService.deleteNotification(
    new mongoose.Types.ObjectId(id),
    req.user._id
  );

  res.json({
    success: true,
    message: 'Notification deleted successfully',
  });
});

// @desc    Create custom notification (admin only)
// @route   POST /api/notifications/custom
// @access  Private/Admin
export const createCustomNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { userId, type, priority, title, message, data, expiresAt } = req.body;

  if (!userId || !type || !title || !message) {
    return next(new AppError('Missing required fields', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new AppError('Invalid user ID', 400));
  }

  const notificationData = {
    userId: new mongoose.Types.ObjectId(userId),
    type,
    priority: priority || 'medium',
    title,
    message,
    data: data || {},
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  };

  const notification = await NotificationService.createNotification(notificationData);

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc    Create bulk notifications (admin only)
// @route   POST /api/notifications/bulk
// @access  Private/Admin
export const createBulkNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { type, priority, title, message, data, expiresAt, excludeUserIds } = req.body;

  if (!type || !title || !message) {
    return next(new AppError('Missing required fields', 400));
  }

  const bulkData = {
    type,
    priority: priority || 'medium',
    title,
    message,
    data: data || {},
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    excludeUserIds: excludeUserIds ? excludeUserIds.map((id: string) => new mongoose.Types.ObjectId(id)) : undefined,
  };

  const result = await NotificationService.createBulkNotifications(bulkData);

  res.status(201).json({
    success: true,
    data: result,
  });
});

// @desc    Clean up expired notifications (admin only)
// @route   DELETE /api/notifications/cleanup
// @access  Private/Admin
export const cleanupExpiredNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const result = await NotificationService.cleanupExpiredNotifications();

  res.json({
    success: true,
    data: result,
  });
});

// @desc    Get all notifications (admin only)
// @route   GET /api/notifications/all
// @access  Private/Admin
export const getAllNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const userId = req.query.userId as string;
  const type = req.query.type as string;
  const priority = req.query.priority as string;
  const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
  const isArchived = req.query.isArchived === 'true' ? true : req.query.isArchived === 'false' ? false : undefined;

  const filters = {
    page,
    limit,
    userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    type,
    priority,
    isRead,
    isArchived,
  };

  const result = await NotificationService.getAllNotifications(filters);

  res.json({
    success: true,
    data: result,
  });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getNotificationPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  // For now, return default preferences
  // This can be extended with a separate preferences model
  const preferences = {
    email: true,
    push: true,
    inApp: true,
    types: {
      hackathon: true,
      news: true,
      channel: true,
      problem: true,
      resource: true,
      project_approval: true,
      custom: true,
      system: true,
    },
  };

  res.json({
    success: true,
    data: preferences,
  });
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updateNotificationPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  const { email, push, inApp, types } = req.body;

  // For now, just return success
  // This can be extended with a separate preferences model
  res.json({
    success: true,
    message: 'Preferences updated successfully',
  });
});

