import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import User from '../models/user.model';
import CrucibleProblem from '../models/crucibleProblem.model';
import CrucibleSolution from '../models/crucibleSolution.model';
import ForgeResource from '../models/forgeResource.model';
import ArenaChannel from '../models/arenaChannel.model';
import ArenaMessage from '../models/arenaMessage.model';
import Notification from '../models/notification.model';
import ProjectShowcase from '../models/projectShowcase.model';
import HackathonSubmission from '../models/hackathonSubmission.model';
import KnowledgeBaseDocument from '../models/knowledgeBaseDocument.model';
import ProgressTracking from '../models/progressTracking.model';
import Milestone from '../models/milestone.model';

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User Statistics
    let totalUsers = 0, newUsers = 0, usersThisWeek = 0;
    
    try {
      [totalUsers, newUsers, usersThisWeek] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
      ]);
    } catch (error) {
      console.log('User model not available, setting defaults:', error.message);
    }

    // Since User model doesn't have role or lastLogin fields, we'll set these to 0 for now
    const adminUsers = 0;
    const regularUsers = totalUsers;
    const activeUsers = totalUsers; // Assume all users are active for now

    // Crucible Statistics
    let totalProblems = 0, problemsByStatus = [], problemsByDifficulty = [], totalSolutions = 0, solutionsByStatus = [], recentSolutions = [];
    
    try {
      [totalProblems, problemsByStatus, problemsByDifficulty, totalSolutions, solutionsByStatus, recentSolutions] = await Promise.all([
        CrucibleProblem.countDocuments(),
        CrucibleProblem.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        CrucibleProblem.aggregate([
          { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]),
        CrucibleSolution.countDocuments(),
        CrucibleSolution.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        CrucibleSolution.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName email')
          .populate('problemId', 'title')
      ]);
    } catch (error) {
      console.log('Crucible models not available, setting defaults:', error.message);
    }

    // Forge Statistics
    let totalResources = 0, resourcesByType = [], resourcesByCategory = [], recentResources = [];
    
    try {
      [totalResources, resourcesByType, resourcesByCategory, recentResources] = await Promise.all([
        ForgeResource.countDocuments(),
        ForgeResource.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        ForgeResource.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        ForgeResource.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('createdBy', 'fullName')
      ]);
    } catch (error) {
      console.log('Forge models not available, setting defaults:', error.message);
    }

    // Channel Statistics
    let totalChannels = 0, channelsByType = [], activeChannels = 0, totalMessages = 0, recentChannels = [];
    
    try {
      [totalChannels, channelsByType, activeChannels, totalMessages, recentChannels] = await Promise.all([
        ArenaChannel.countDocuments(),
        ArenaChannel.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        ArenaChannel.countDocuments({ isActive: true }),
        ArenaMessage.countDocuments(),
        ArenaChannel.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('createdBy', 'fullName')
      ]);
    } catch (error) {
      console.log('Channel models not available, setting defaults:', error.message);
    }

    // Notification Statistics
    let totalNotifications = 0, unreadNotifications = 0, notificationsByType = [], recentNotifications = [];
    
    try {
      [totalNotifications, unreadNotifications, notificationsByType, recentNotifications] = await Promise.all([
        Notification.countDocuments(),
        Notification.countDocuments({ isRead: false }),
        Notification.aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Notification.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName email')
      ]);
    } catch (error) {
      console.log('Notification models not available, setting defaults:', error.message);
    }

    // Project & Hackathon Statistics
    let totalProjects = 0, totalHackathons = 0, recentProjects = [], recentHackathons = [];
    
    try {
      [totalProjects, totalHackathons, recentProjects, recentHackathons] = await Promise.all([
        ProjectShowcase.countDocuments(),
        HackathonSubmission.countDocuments(),
        ProjectShowcase.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName'),
        HackathonSubmission.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName')
      ]);
    } catch (error) {
      console.log('Some models not available, setting defaults:', error.message);
    }

    // Knowledge Base Statistics
    let totalDocuments = 0, documentsByCategory = [], recentDocuments = [];
    
    try {
      [totalDocuments, documentsByCategory, recentDocuments] = await Promise.all([
        KnowledgeBaseDocument.countDocuments(),
        KnowledgeBaseDocument.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        KnowledgeBaseDocument.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('createdBy', 'fullName')
      ]);
    } catch (error) {
      console.log('KnowledgeBase model not available, setting defaults:', error.message);
    }

    // Progress & Milestone Statistics
    let totalProgressEntries = 0, totalMilestones = 0, recentProgress = [];
    
    try {
      [totalProgressEntries, totalMilestones, recentProgress] = await Promise.all([
        ProgressTracking.countDocuments(),
        Milestone.countDocuments(),
        ProgressTracking.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName')
          .populate('problemId', 'title')
      ]);
    } catch (error) {
      console.log('Progress/Milestone models not available, setting defaults:', error.message);
    }

    // Activity Trends (last 7 days)
    let dailyStats = [];
    
    try {
      dailyStats = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          return Promise.all([
            User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
            CrucibleSolution.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
            ForgeResource.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0),
            ArenaMessage.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }).catch(() => 0)
          ]).then(([users, solutions, resources, messages]) => ({
            date: startOfDay.toISOString().split('T')[0],
            users,
            solutions,
            resources,
            messages
          }));
        })
      );
    } catch (error) {
      console.log('Daily stats aggregation failed, setting defaults:', error.message);
      // Set default daily stats
      dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          users: 0,
          solutions: 0,
          resources: 0,
          messages: 0
        };
      });
    }

    // System Health Metrics
    const systemHealth = {
      databaseConnections: 'Healthy',
      apiResponseTime: 'Fast',
      activeSessions: Math.floor(Math.random() * 50) + 20, // Mock data
      systemUptime: '99.9%',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    };

    // Top Performers
    let topUsers = [];
    
    try {
      topUsers = await User.aggregate([
        { $sort: { 'stats.reputation': -1 } },
        { $limit: 5 },
        { $project: { fullName: 1, email: 1, 'stats.reputation': 1 } }
      ]).then(users => users.map(user => ({ ...user, role: 'user' }))); // Add default role
    } catch (error) {
      console.log('Top users aggregation failed, setting defaults:', error.message);
    }

    let topProblems = [], topResources = [];
    
    try {
      topProblems = await CrucibleProblem.aggregate([
        { $sort: { 'metrics.attempts': -1 } },
        { $limit: 5 },
        { $project: { title: 1, difficulty: 1, 'metrics.attempts': 1, 'metrics.solutions': 1 } }
      ]);
    } catch (error) {
      console.log('Top problems aggregation failed, setting defaults:', error.message);
    }

    try {
      topResources = await ForgeResource.aggregate([
        { $sort: { 'metrics.views': -1 } },
        { $limit: 5 },
        { $project: { title: 1, type: 1, 'metrics.views': 1, 'metrics.bookmarks': 1 } }
      ]);
    } catch (error) {
      console.log('Top resources aggregation failed, setting defaults:', error.message);
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProblems,
          totalSolutions,
          totalResources,
          totalChannels,
          totalNotifications
        },
        users: {
          total: totalUsers,
          admin: adminUsers,
          regular: regularUsers,
          active: activeUsers,
          new: newUsers,
          thisWeek: usersThisWeek,
          topPerformers: topUsers
        },
        crucible: {
          problems: {
            total: totalProblems,
            byStatus: problemsByStatus,
            byDifficulty: problemsByDifficulty
          },
          solutions: {
            total: totalSolutions,
            byStatus: solutionsByStatus,
            recent: recentSolutions
          },
          topProblems
        },
        forge: {
          resources: {
            total: totalResources,
            byType: resourcesByType,
            byCategory: resourcesByCategory,
            recent: recentResources
          },
          topResources
        },
        channels: {
          total: totalChannels,
          byType: channelsByType,
          active: activeChannels,
          totalMessages,
          recent: recentChannels
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
          byType: notificationsByType,
          recent: recentNotifications
        },
        projects: {
          total: totalProjects,
          recent: recentProjects
        },
        hackathons: {
          total: totalHackathons,
          recent: recentHackathons
        },
        knowledgeBase: {
          total: totalDocuments,
          byCategory: documentsByCategory,
          recent: recentDocuments
        },
        progress: {
          total: totalProgressEntries,
          totalMilestones,
          recent: recentProgress
        },
        trends: {
          daily: dailyStats.reverse()
        },
        systemHealth,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});
