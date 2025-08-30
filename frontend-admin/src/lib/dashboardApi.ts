import { useApi } from './api';

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProblems: number;
    totalSolutions: number;
    totalResources: number;
    totalChannels: number;
    totalNotifications: number;
  };
  users: {
    total: number;
    admin: number;
    regular: number;
    active: number;
    new: number;
    thisWeek: number;
    topPerformers: Array<{
      _id: string;
      fullName: string;
      email: string;
      'stats.reputation': number;
      role: string;
    }>;
  };
  crucible: {
    problems: {
      total: number;
      byStatus: Array<{ _id: string; count: number }>;
      byDifficulty: Array<{ _id: string; count: number }>;
    };
    solutions: {
      total: number;
      byStatus: Array<{ _id: string; count: number }>;
      recent: Array<{
        _id: string;
        userId: { fullName: string; email: string };
        problemId: { title: string };
        createdAt: string;
        status: string;
      }>;
    };
    topProblems: Array<{
      _id: string;
      title: string;
      difficulty: string;
      'metrics.attempts': number;
      'metrics.solutions': number;
    }>;
  };
  forge: {
    resources: {
      total: number;
      byType: Array<{ _id: string; count: number }>;
      byCategory: Array<{ _id: string; count: number }>;
      recent: Array<{
        _id: string;
        title: string;
        type: string;
        category: string;
        createdBy: { fullName: string };
        createdAt: string;
      }>;
    };
    topResources: Array<{
      _id: string;
      title: string;
      type: string;
      'metrics.views': number;
      'metrics.bookmarks': number;
    }>;
  };
  channels: {
    total: number;
    byType: Array<{ _id: string; count: number }>;
    active: number;
    totalMessages: number;
    recent: Array<{
      _id: string;
      name: string;
      type: string;
      createdBy: { fullName: string };
      createdAt: string;
    }>;
  };
  notifications: {
    total: number;
    unread: number;
    byType: Array<{ _id: string; count: number }>;
    recent: Array<{
      _id: string;
      title: string;
      type: string;
      userId: { fullName: string; email: string };
      createdAt: string;
    }>;
  };
  projects: {
    total: number;
    recent: Array<{
      _id: string;
      title: string;
      userId: { fullName: string };
      createdAt: string;
    }>;
  };
  hackathons: {
    total: number;
    recent: Array<{
      _id: string;
      title: string;
      userId: { fullName: string };
      createdAt: string;
    }>;
  };
  knowledgeBase: {
    total: number;
    byCategory: Array<{ _id: string; count: number }>;
    recent: Array<{
      _id: string;
      title: string;
      category: string;
      createdBy: { fullName: string };
      createdAt: string;
    }>;
  };
  progress: {
    total: number;
    totalMilestones: number;
    recent: Array<{
      _id: string;
      userId: { fullName: string };
      problemId: { title: string };
      createdAt: string;
    }>;
  };
  trends: {
    daily: Array<{
      date: string;
      users: number;
      solutions: number;
      resources: number;
      messages: number;
    }>;
  };
  systemHealth: {
    databaseConnections: string;
    apiResponseTime: string;
    activeSessions: number;
    systemUptime: string;
    lastBackup: string;
  };
  lastUpdated: string;
}

export const useDashboardApi = () => {
  const apiFetch = useApi();

  const getDashboardStats = async (): Promise<{ success: boolean; data: DashboardStats }> => {
    return apiFetch('/dashboard/stats');
  };

  return {
    getDashboardStats,
  };
};
