import { useApi } from './api';

export interface Notification {
  _id: string;
  userId: string | { _id: string; fullName: string; email: string };
  type: 'hackathon' | 'news' | 'channel' | 'problem' | 'resource' | 'project_approval' | 'custom' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  data?: {
    entityId?: string;
    entityType?: string;
    action?: string;
    metadata?: any;
  };
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  archived: number;
  byType: { [key: string]: number };
  byPriority: { [key: string]: number };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  priority?: string;
}

export interface CreateNotificationData {
  userId: string;
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
  expiresAt?: string;
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
  expiresAt?: string;
  excludeUserIds?: string[];
}

export const useNotificationApi = () => {
  const apiFetch = useApi();

  const getNotifications = async (filters: NotificationFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.priority) params.append('priority', filters.priority);

    return apiFetch(`/notifications?${params.toString()}`);
  };

  const getNotificationStats = async () => {
    return apiFetch('/notifications/stats');
  };

  const markNotificationAsRead = async (notificationId: string) => {
    return apiFetch(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  };

  const markAllNotificationsAsRead = async () => {
    return apiFetch('/notifications/read-all', {
      method: 'PUT',
    });
  };

  const archiveNotification = async (notificationId: string) => {
    return apiFetch(`/notifications/${notificationId}/archive`, {
      method: 'PUT',
    });
  };

  const deleteNotification = async (notificationId: string) => {
    return apiFetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  };

  const createCustomNotification = async (data: CreateNotificationData) => {
    return apiFetch('/notifications/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const createBulkNotifications = async (data: BulkNotificationData) => {
    return apiFetch('/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const cleanupExpiredNotifications = async () => {
    return apiFetch('/notifications/cleanup', {
      method: 'DELETE',
    });
  };

  const getAllNotifications = async (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());

    return apiFetch(`/notifications/all?${params.toString()}`);
  };

  const getNotificationPreferences = async () => {
    return apiFetch('/notifications/preferences');
  };

  const updateNotificationPreferences = async (preferences: any) => {
    return apiFetch('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  };

  return {
    getNotifications,
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
  };
};
