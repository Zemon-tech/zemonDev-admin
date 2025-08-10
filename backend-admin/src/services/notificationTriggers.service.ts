import mongoose from 'mongoose';
import { NotificationService } from './notification.service';
import User from '../models/user.model';

export class NotificationTriggers {
  /**
   * Trigger notification when a new forge resource is created
   */
  static async onForgeResourceCreated(resourceData: any): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'resource',
        priority: 'medium',
        title: 'New Tool Available! 🛠️',
        message: `A new ${resourceData.type} resource "${resourceData.title}" has been added to the Forge.`,
        data: {
          entityId: resourceData._id.toString(),
          entityType: 'resource',
          action: 'created',
          metadata: {
            resourceId: resourceData._id,
            resourceType: resourceData.type,
            resourceTitle: resourceData.title,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger forge resource notification:', error);
    }
  }

  /**
   * Trigger notification when a new hackathon is created
   */
  static async onHackathonCreated(hackathonData: any): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'hackathon',
        priority: 'high',
        title: 'New Hackathon Available! 🚀',
        message: `A new hackathon "${hackathonData.title}" has been announced.`,
        data: {
          entityId: hackathonData._id.toString(),
          entityType: 'hackathon',
          action: 'created',
          metadata: {
            hackathonId: hackathonData._id,
            hackathonTitle: hackathonData.title,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger hackathon notification:', error);
    }
  }

  /**
   * Trigger notification when a new news item is posted
   */
  static async onNewsCreated(newsData: any): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'news',
        priority: 'medium',
        title: 'Latest News Update! 📰',
        message: `New news: "${newsData.title}"`,
        data: {
          entityId: newsData._id.toString(),
          entityType: 'news',
          action: 'created',
          metadata: {
            newsId: newsData._id,
            newsTitle: newsData.title,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger news notification:', error);
    }
  }

  /**
   * Trigger notification when a project is approved
   */
  static async onProjectApproved(projectData: any, userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        type: 'project_approval',
        priority: 'high',
        title: 'Project Approved! 🎉',
        message: `Your project "${projectData.title}" has been approved by the admin.`,
        data: {
          entityId: projectData._id.toString(),
          entityType: 'project',
          action: 'approved',
          metadata: {
            projectId: projectData._id,
            projectTitle: projectData.title,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger project approval notification:', error);
    }
  }

  /**
   * Trigger notification when a new channel is created
   */
  static async onChannelCreated(channelData: any): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'channel',
        priority: 'medium',
        title: 'New Channel Created! 💬',
        message: `A new channel "${channelData.name}" has been created.`,
        data: {
          entityId: channelData._id.toString(),
          entityType: 'channel',
          action: 'created',
          metadata: {
            channelId: channelData._id,
            channelName: channelData.name,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger channel notification:', error);
    }
  }

  /**
   * Trigger notification when a new problem is added
   */
  static async onProblemCreated(problemData: any): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'problem',
        priority: 'high',
        title: 'New Problem Available! 🧩',
        message: `A new problem "${problemData.title}" has been added to the Crucible.`,
        data: {
          entityId: problemData._id.toString(),
          entityType: 'problem',
          action: 'created',
          metadata: {
            problemId: problemData._id,
            problemTitle: problemData.title,
            difficulty: problemData.difficulty,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger problem notification:', error);
    }
  }

  /**
   * Trigger system notification for maintenance or updates
   */
  static async sendSystemNotification(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    excludeUserIds?: mongoose.Types.ObjectId[]
  ): Promise<void> {
    try {
      await NotificationService.createBulkNotifications({
        type: 'system',
        priority,
        title,
        message,
        excludeUserIds,
      });
    } catch (error) {
      console.error('Failed to send system notification:', error);
    }
  }

  /**
   * Trigger custom notification to specific user
   */
  static async sendCustomNotification(
    userId: mongoose.Types.ObjectId,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    data?: any
  ): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        type: 'custom',
        priority,
        title,
        message,
        data,
      });
    } catch (error) {
      console.error('Failed to send custom notification:', error);
    }
  }

  /**
   * Trigger welcome notification for new users
   */
  static async onUserRegistered(userId: mongoose.Types.ObjectId, userData: any): Promise<void> {
    try {
      await NotificationService.createNotification({
        userId,
        type: 'system',
        priority: 'medium',
        title: 'Welcome to Zemon! 🎉',
        message: `Welcome ${userData.fullName}! We're excited to have you join our community.`,
        data: {
          entityId: userId.toString(),
          entityType: 'user',
          action: 'registered',
          metadata: {
            welcomeMessage: true,
            userEmail: userData.email,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger welcome notification:', error);
    }
  }

  /**
   * Trigger notification for user achievements
   */
  static async onUserAchievement(
    userId: mongoose.Types.ObjectId,
    achievementType: string,
    achievementData: any
  ): Promise<void> {
    try {
      const achievementMessages = {
        'problem_solved': 'Problem Solved! 🎯',
        'resource_created': 'Resource Created! 🛠️',
        'project_approved': 'Project Approved! ✅',
        'streak_milestone': 'Streak Milestone! 🔥',
        'level_up': 'Level Up! ⬆️',
      };

      const title = achievementMessages[achievementType as keyof typeof achievementMessages] || 'Achievement Unlocked! 🏆';
      const message = `Congratulations! You've achieved: ${achievementData.description}`;

      await NotificationService.createNotification({
        userId,
        type: 'custom',
        priority: 'high',
        title,
        message,
        data: {
          entityId: userId.toString(),
          entityType: 'achievement',
          action: 'unlocked',
          metadata: {
            achievementType,
            achievementData,
          },
        },
      });
    } catch (error) {
      console.error('Failed to trigger achievement notification:', error);
    }
  }
}

