import React, { useState, useEffect } from 'react';
import { useNotificationApi } from '../lib/notificationApi';
import type { Notification, NotificationStats, CreateNotificationData, BulkNotificationData } from '../lib/notificationApi';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Bell, Plus, Search, Users, Eye, Archive, Trash2, TrendingUp, MessageSquare, CheckCircle, Clock, Filter, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface GroupedNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  createdAt: string;
  isRead: boolean;
  isArchived: boolean;
  userCount: number;
  isBulk: boolean;
  originalNotifications: Notification[];
  uniqueUsers: User[];
}

const NotificationsPage: React.FC = () => {
  const notificationApi = useNotificationApi();
  const apiFetch = useApi();
  const { setNavbarTitle, setNavbarActions } = useUIChrome();
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    isRead: undefined as boolean | undefined,
    priority: 'all',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [createForm, setCreateForm] = useState<CreateNotificationData>({
    userId: '',
    type: 'custom',
    priority: 'medium',
    title: '',
    message: '',
  });
  const [bulkForm, setBulkForm] = useState<BulkNotificationData>({
    type: 'custom',
    priority: 'medium',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  useEffect(() => {
    setNavbarTitle(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Bell size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold">Notifications</div>
          <div className="text-sm text-base-content/70">Manage system notifications and alerts</div>
        </div>
      </div>
    );
    setNavbarActions(
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="btn-primary"
        >
          <Plus size={16} className="mr-1" />
          Create Notification
        </Button>
        <Button 
          onClick={() => setShowBulkModal(true)}
          size="sm"
          variant="outline"
        >
          <Users size={16} className="mr-1" />
          Bulk Notification
        </Button>
      </div>
    );

    return () => {
      setNavbarTitle(null);
      setNavbarActions(null);
    };
  }, []);

  const groupNotifications = (notifications: Notification[]): GroupedNotification[] => {
    const grouped: { [key: string]: GroupedNotification } = {};
    
    notifications.forEach(notification => {
      // Create a unique key for grouping based on content and type
      const key = `${notification.title}-${notification.message}-${notification.type}-${notification.priority}`;
      
      if (grouped[key]) {
        // Add to existing group
        grouped[key].userCount++;
        grouped[key].originalNotifications.push(notification);
        
        // Add unique users
        if (typeof notification.userId === 'object' && notification.userId) {
          const existingUser = grouped[key].uniqueUsers.find(u => u._id === (notification.userId as User)._id);
          if (!existingUser) {
            grouped[key].uniqueUsers.push(notification.userId as User);
          }
        }
        
        // Update read/archived status
        if (notification.isRead) grouped[key].isRead = true;
        if (notification.isArchived) grouped[key].isArchived = true;
      } else {
        // Create new group
        const uniqueUsers: User[] = [];
        if (typeof notification.userId === 'object' && notification.userId) {
          uniqueUsers.push(notification.userId);
        }
        
        grouped[key] = {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
          isArchived: notification.isArchived,
          userCount: 1,
          isBulk: false,
          originalNotifications: [notification],
          uniqueUsers
        };
      }
    });
    
    // Determine if it's a bulk notification
    Object.values(grouped).forEach(group => {
      if (group.userCount > 1) {
        group.isBulk = true;
      }
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Prepare filters for API call
      const apiFilters = {
        page: currentPage,
        limit: 20,
        type: filters.type === 'all' ? '' : filters.type,
        isRead: filters.isRead,
        priority: filters.priority === 'all' ? '' : filters.priority,
      };

      const [notificationsData, statsData, usersData] = await Promise.all([
        notificationApi.getAllNotifications(apiFilters),
        notificationApi.getNotificationStats(),
        apiFetch('/users'),
      ]);

      const grouped = groupNotifications(notificationsData.data.notifications);
      setGroupedNotifications(grouped);
      setTotalPages(notificationsData.data.totalPages);
      setStats(statsData.data);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markNotificationAsRead(notificationId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await notificationApi.archiveNotification(notificationId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive notification');
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await notificationApi.deleteNotification(notificationId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const handleCreateNotification = async () => {
    try {
      await notificationApi.createCustomNotification(createForm);
      setShowCreateModal(false);
      setCreateForm({
        userId: '',
        type: 'custom',
        priority: 'medium',
        title: '',
        message: '',
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    }
  };

  const handleCreateBulkNotification = async () => {
    try {
      await notificationApi.createBulkNotifications(bulkForm);
      setShowBulkModal(false);
      setBulkForm({
        type: 'custom',
        priority: 'medium',
        title: '',
        message: '',
      });
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bulk notification');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to cleanup expired notifications?')) return;
    
    try {
      await notificationApi.cleanupExpiredNotifications();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup notifications');
    }
  };

  const toggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'high': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hackathon': return '🚀';
      case 'news': return '📰';
      case 'channel': return '💬';
      case 'problem': return '🧩';
      case 'resource': return '🛠️';
      case 'project_approval': return '✅';
      case 'custom': return '📢';
      case 'system': return '⚙️';
      default: return '📌';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'hackathon': return 'bg-primary/10 text-primary hover:bg-primary/10';
      case 'news': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'channel': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'problem': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'resource': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'project_approval': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'custom': return 'bg-accent/10 text-accent hover:bg-accent/10';
      case 'system': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
    
  if (error) return (
    <div className="alert alert-error max-w-md mx-auto">
      <span>Error: {error}</span>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <Card className="border-primary/20 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-primary">{stats.total}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
                <Bell size={10} className="text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-600">{stats.unread}</div>
                  <div className="text-[10px] text-muted-foreground">Unread</div>
                </div>
                <Eye size={10} className="text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-yellow-600">{stats.archived}</div>
                  <div className="text-[10px] text-muted-foreground">Archived</div>
                </div>
                <Archive size={10} className="text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-green-600">{Object.keys(stats.byType).length}</div>
                  <div className="text-[10px] text-muted-foreground">Types</div>
                </div>
                <MessageSquare size={10} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-600">{currentPage}</div>
                  <div className="text-[10px] text-muted-foreground">Page</div>
                </div>
                <TrendingUp size={10} className="text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-info-200 !py-2 !px-2">
            <CardContent className="!p-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-info-600">{totalPages}</div>
                  <div className="text-[10px] text-muted-foreground">Total Pages</div>
                </div>
                <Clock size={10} className="text-info-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search notifications..." 
                className="pl-10" 
              />
            </div>
          </div>
          <Select value={filters.type || "all"} onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="channel">Channel</SelectItem>
              <SelectItem value="problem">Problem</SelectItem>
              <SelectItem value="resource">Resource</SelectItem>
              <SelectItem value="project_approval">Project Approval</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.isRead === undefined ? 'all' : filters.isRead.toString()} 
            onValueChange={(value) => setFilters({ ...filters, isRead: value === 'all' ? undefined : value === 'true' })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="false">Unread</SelectItem>
              <SelectItem value="true">Read</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.priority || "all"} onValueChange={(value) => setFilters({ ...filters, priority: value === "all" ? "" : value })}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setFilters({ type: 'all', isRead: undefined, priority: 'all' })}
            variant="outline"
            size="sm"
          >
            <Filter size={16} className="mr-1" />
            Clear
          </Button>
          <Button
            onClick={handleCleanup}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={16} className="mr-1" />
            Cleanup
          </Button>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-sm">Notification</th>
                <th className="text-left p-3 font-medium text-sm">Recipients</th>
                <th className="text-left p-3 font-medium text-sm">Type</th>
                <th className="text-left p-3 font-medium text-sm">Priority</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Date</th>
                <th className="text-left p-3 font-medium text-sm w-20">Details</th>
                <th className="text-left p-3 font-medium text-sm w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No notifications found matching your filters
                  </td>
                </tr>
              ) : (
                groupedNotifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <tr className={`border-t hover:bg-muted/30 transition-colors ${notification.isRead ? 'bg-muted/10' : 'bg-white'}`}>
                      <td className="p-3">
                        <div className="max-w-[200px]">
                          <div className="font-medium flex items-center gap-2" title={notification.title}>
                            {notification.title.length > 40 ? notification.title.substring(0, 40) + '...' : notification.title}
                            {notification.isBulk && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                                Bulk
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message.length > 60 ? notification.message.substring(0, 60) + '...' : notification.message}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">
                            {notification.userCount} {notification.userCount === 1 ? 'user' : 'users'}
                          </div>
                          {notification.isBulk && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
                              <Users size={12} className="mr-1" />
                              All
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={getTypeBadgeClass(notification.type)}>
                          {getTypeIcon(notification.type)} {notification.type}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className={getPriorityBadgeClass(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {notification.isRead ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle size={12} className="mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <Eye size={12} className="mr-1" />
                              Unread
                            </Badge>
                          )}
                          {notification.isArchived && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                              <Archive size={12} className="mr-1" />
                              Archived
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleExpanded(notification._id)}
                          className="w-full"
                        >
                          {expandedNotifications.has(notification._id) ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </Button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <CheckCircle size={14} />
                            </Button>
                          )}
                          {!notification.isArchived && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleArchive(notification._id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Archive size={14} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(notification._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedNotifications.has(notification._id) && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-muted/20 border-t border-muted p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Notification Details */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <MessageSquare size={16} className="text-primary" />
                                  Notification Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Full Title:</strong> {notification.title}</div>
                                  <div><strong>Message:</strong> {notification.message}</div>
                                  <div><strong>Type:</strong> 
                                    <Badge variant="secondary" className={`ml-2 ${getTypeBadgeClass(notification.type)}`}>
                                      {getTypeIcon(notification.type)} {notification.type}
                                    </Badge>
                                  </div>
                                  <div><strong>Priority:</strong> 
                                    <Badge variant="secondary" className={`ml-2 ${getPriorityBadgeClass(notification.priority)}`}>
                                      {notification.priority}
                                    </Badge>
                                  </div>
                                  <div><strong>Created:</strong> {new Date(notification.createdAt).toLocaleString()}</div>
                                  <div><strong>Total Recipients:</strong> {notification.userCount} users</div>
                                </div>
                              </div>

                              {/* Recipients List */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Users size={16} className="text-primary" />
                                  Recipients ({notification.uniqueUsers.length})
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {notification.uniqueUsers.length > 0 ? (
                                    notification.uniqueUsers.map((user) => (
                                      <div key={user._id} className="text-sm p-2 bg-base-100 rounded border">
                                        <div className="font-medium">{user.fullName}</div>
                                        <div className="text-muted-foreground">{user.email}</div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-muted-foreground">No specific users (bulk notification)</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="join-item"
            >
              Previous
            </Button>
            <div className="join-item px-4 py-2 bg-base-200 text-sm flex items-center">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="join-item"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Create Notification</h3>
                <p className="text-sm text-base-content/70">Send a notification to a specific user</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* User Selection */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Target User
                  </span>
                  <span className="label-text-alt text-base-content/70">Required</span>
                </label>
                <select
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select a user to notify</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label pb-2">
                    <span className="label-text font-medium flex items-center gap-2">
                      <MessageSquare size={16} className="text-primary" />
                      Type
                    </span>
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                    className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="custom">📢 Custom</option>
                    <option value="hackathon">🚀 Hackathon</option>
                    <option value="news">📰 News</option>
                    <option value="channel">💬 Channel</option>
                    <option value="problem">🧩 Problem</option>
                    <option value="resource">🛠️ Resource</option>
                    <option value="project_approval">✅ Project Approval</option>
                    <option value="system">⚙️ System</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label pb-2">
                    <span className="label-text font-medium flex items-center gap-2">
                      <AlertTriangle size={16} className="text-primary" />
                      Priority
                    </span>
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as any })}
                    className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    Title
                  </span>
                  <span className="label-text-alt text-base-content/70">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a clear, concise title..."
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    Message
                  </span>
                  <span className="label-text-alt text-base-content/70">Required</span>
                </label>
                <textarea
                  placeholder="Write a detailed message for the user..."
                  value={createForm.message}
                  onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                  className="textarea textarea-bordered h-24 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">
                    {createForm.message.length}/500 characters
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-action pt-6 border-t border-base-300">
              <Button 
                onClick={() => setShowCreateModal(false)} 
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateNotification} 
                className="btn-primary"
                size="sm"
                disabled={!createForm.userId || !createForm.title || !createForm.message}
              >
                <Bell size={16} className="mr-1" />
                Send Notification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
              <div className="p-2 bg-success/10 text-success rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Bulk Notification</h3>
                <p className="text-sm text-base-content/70">Send notification to all users at once</p>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="alert alert-warning mb-6">
              <AlertTriangle size={20} />
              <div>
                <h4 className="font-medium">Bulk Notification Warning</h4>
                <p className="text-sm">This will send the notification to ALL registered users. Please ensure the content is appropriate for everyone.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Type and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label pb-2">
                    <span className="label-text font-medium flex items-center gap-2">
                      <MessageSquare size={16} className="text-primary" />
                      Type
                    </span>
                  </label>
                  <select
                    value={bulkForm.type}
                    onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value as any })}
                    className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="custom">📢 Custom</option>
                    <option value="hackathon">🚀 Hackathon</option>
                    <option value="news">📰 News</option>
                    <option value="channel">💬 Channel</option>
                    <option value="problem">🧩 Problem</option>
                    <option value="resource">🛠️ Resource</option>
                    <option value="project_approval">✅ Project Approval</option>
                    <option value="system">⚙️ System</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label pb-2">
                    <span className="label-text font-medium flex items-center gap-2">
                      <AlertTriangle size={16} className="text-primary" />
                      Priority
                    </span>
                  </label>
                  <select
                    value={bulkForm.priority}
                    onChange={(e) => setBulkForm({ ...bulkForm, priority: e.target.value as any })}
                    className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    Title
                  </span>
                  <span className="label-text-alt text-base-content/70">Required</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a clear, concise title for all users..."
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })}
                  className="input input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    Message
                  </span>
                  <span className="label-text-alt text-base-content/70">Required</span>
                </label>
                <textarea
                  placeholder="Write a message that will be sent to all users..."
                  value={bulkForm.message}
                  onChange={(e) => setBulkForm({ ...bulkForm, message: e.target.value })}
                  className="textarea textarea-bordered h-24 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
                <label className="label pt-1">
                  <span className="label-text-alt text-base-content/70">
                    {bulkForm.message.length}/500 characters
                  </span>
                </label>
              </div>

              {/* Preview */}
              <div className="form-control">
                <label className="label pb-2">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Eye size={16} className="text-primary" />
                    Preview
                  </span>
                </label>
                <div className="bg-base-200 rounded-lg p-4 border border-base-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={getTypeBadgeClass(bulkForm.type || 'custom')}>
                      {getTypeIcon(bulkForm.type || 'custom')} {bulkForm.type || 'custom'}
                    </Badge>
                    <Badge variant="secondary" className={getPriorityBadgeClass(bulkForm.priority || 'medium')}>
                      {bulkForm.priority || 'medium'}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-base mb-1">{bulkForm.title || 'Notification Title'}</h4>
                  <p className="text-sm text-base-content/70">{bulkForm.message || 'Notification message will appear here...'}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-action pt-6 border-t border-base-300">
              <Button 
                onClick={() => setShowBulkModal(false)} 
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBulkNotification} 
                className="btn-success"
                size="sm"
                disabled={!bulkForm.title || !bulkForm.message}
              >
                <Users size={16} className="mr-1" />
                Send to All Users ({users.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
