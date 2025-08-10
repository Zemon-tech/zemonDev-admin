import mongoose from 'mongoose';
import Notification, { INotification } from '../models/notification.model';
import User from '../models/user.model';
import { AppError } from '../utils/AppError';

export interface CreateNotificationData {
  userId: mongoose.Types.ObjectId;
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  expiresAt?: Date;
}

export interface BulkNotificationData {
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  expiresAt?: Date;
  excludeUserIds?: mongoose.Types.ObjectId[];
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  priority?: string;
  page?: number;
  limit?: number;
}

export class NotificationService {
  /**
   * Create a single notification for a user
   */
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      // Verify user exists
      const user = await User.findById(data.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const notification = new Notification({
        userId: data.userId,
        type: data.type,
        priority: data.priority || 'medium',
        title: data.title,
        message: data.message,
        data: data.data || {},
        expiresAt: data.expiresAt,
      });

      const savedNotification = await notification.save();
      return savedNotification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create notifications for all users (bulk notification)
   */
  static async createBulkNotifications(data: BulkNotificationData): Promise<{ success: number; failed: number }> {
    try {
      // Get all users except excluded ones
      const query: any = {};
      if (data.excludeUserIds && data.excludeUserIds.length > 0) {
        query._id = { $nin: data.excludeUserIds };
      }

      const users = await User.find(query).select('_id');
      if (users.length === 0) {
        return { success: 0, failed: 0 };
      }

      const notifications = users.map(user => ({
        userId: user._id,
        type: data.type,
        priority: data.priority || 'medium',
        title: data.title,
        message: data.message,
        data: data.data || {},
        expiresAt: data.expiresAt,
      }));

      const result = await Notification.insertMany(notifications);
      return { success: result.length, failed: 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notifications for a user with pagination and filters
   */
  static async getUserNotifications(
    userId: mongoose.Types.ObjectId,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: INotification[]; total: number; page: number; totalPages: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const query: any = { userId };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'fullName email'),
        Notification.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markNotificationAsRead(
    notificationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<INotification> {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllNotificationsAsRead(userId: mongoose.Types.ObjectId): Promise<{ modifiedCount: number }> {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      return { modifiedCount: result.modifiedCount || 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive a notification
   */
  static async archiveNotification(
    notificationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<INotification> {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isArchived: true },
        { new: true }
      );

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }

      return notification;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getNotificationStats(userId: mongoose.Types.ObjectId): Promise<{
    total: number;
    unread: number;
    archived: number;
    byType: { [key: string]: number };
    byPriority: { [key: string]: number };
  }> {
    try {
      const [total, unread, archived, byType, byPriority] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, isRead: false }),
        Notification.countDocuments({ userId, isArchived: true }),
        Notification.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        Notification.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
      ]);

      const byTypeMap = byType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      const byPriorityMap = byPriority.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        total,
        unread,
        archived,
        byType: byTypeMap,
        byPriority: byPriorityMap,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<{ deletedCount: number }> {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all notifications (admin function)
   */
  static async getAllNotifications(filters: any = {}): Promise<{
    notifications: INotification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (filters.userId) {
        query.userId = filters.userId;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.isRead !== undefined) {
        query.isRead = filters.isRead;
      }

      if (filters.isArchived !== undefined) {
        query.isArchived = filters.isArchived;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'fullName email'),
        Notification.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }
}

