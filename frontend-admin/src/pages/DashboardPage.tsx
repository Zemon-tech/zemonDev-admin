import React, { useState, useEffect } from 'react';
import { useDashboardApi, type DashboardStats } from '../lib/dashboardApi';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  Flame, 
  MessageSquare, 
  Bell, 
  Trophy, 
  TrendingUp, 
  Activity, 
  Eye,
  Star,
  BarChart3,
  Target,
  Shield,
  Database,
  Server,
  Network,
  AlertCircle,

  RefreshCw,
  Info,
  Clock
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const dashboardApi = useDashboardApi();
  const { setNavbarTitle, setNavbarActions } = useUIChrome();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setNavbarTitle(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg">
          <BarChart3 size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold">Dashboard</div>
          <div className="text-sm text-muted-foreground">Comprehensive system overview & analytics</div>
        </div>
      </div>
    );
    setNavbarActions(
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => window.location.reload()}
          size="sm"
          variant="outline"
        >
          <RefreshCw size={16} className="mr-1" />
          Refresh
        </Button>
        <Button 
          onClick={() => setActiveTab('trends')}
          size="sm"
          className="btn-primary"
        >
          <TrendingUp size={16} className="mr-1" />
          View Trends
        </Button>
      </div>
    );

    return () => {
      setNavbarTitle(null);
      setNavbarActions(null);
    };
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-muted-foreground">Loading comprehensive dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="alert alert-error max-w-md mx-auto">
        <AlertCircle size={20} />
        <span>Error: {error || 'Failed to load dashboard data'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-primary/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-primary">{formatNumber(stats.overview.totalUsers || 0)}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <Users size={16} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-secondary">{formatNumber(stats.overview.totalProblems || 0)}</div>
                <div className="text-xs text-muted-foreground">Problems</div>
              </div>
              <BookOpen size={16} className="text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-accent">{formatNumber(stats.overview.totalSolutions || 0)}</div>
                <div className="text-xs text-muted-foreground">Solutions</div>
              </div>
              <Target size={16} className="text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-warning">{formatNumber(stats.overview.totalResources || 0)}</div>
                <div className="text-xs text-muted-foreground">Resources</div>
              </div>
              <Flame size={16} className="text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-info/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-info">{formatNumber(stats.overview.totalChannels || 0)}</div>
                <div className="text-xs text-muted-foreground">Channels</div>
              </div>
              <MessageSquare size={16} className="text-info" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20 !py-3 !px-3">
          <CardContent className="!p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-success">{formatNumber(stats.overview.totalNotifications || 0)}</div>
                <div className="text-xs text-muted-foreground">Notifications</div>
              </div>
              <Bell size={16} className="text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="crucible">Crucible</TabsTrigger>
          <TabsTrigger value="forge">Forge</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={18} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recent Solutions</h4>
                  {(stats.crucible.solutions.recent || []).slice(0, 3).map((solution) => (
                    <div key={solution._id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                      <div>
                        <div className="font-medium">{solution.userId.fullName}</div>
                        <div className="text-muted-foreground">{solution.problemId.title}</div>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(solution.status)}>
                        {solution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={18} />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-green-500" />
                    <span>Database: {stats.systemHealth.databaseConnections}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-blue-500" />
                    <span>API: {stats.systemHealth.apiResponseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network size={14} className="text-purple-500" />
                    <span>Uptime: {stats.systemHealth.systemUptime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-orange-500" />
                    <span>Sessions: {stats.systemHealth.activeSessions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="!py-3 !px-3">
              <CardContent className="!p-2 text-center">
                <div className="text-2xl font-bold text-primary">{stats.users.active || 0}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </CardContent>
            </Card>
            <Card className="!py-3 !px-3">
              <CardContent className="!p-2 text-center">
                <div className="text-2xl font-bold text-secondary">{stats.channels.active || 0}</div>
                <div className="text-xs text-muted-foreground">Active Channels</div>
              </CardContent>
            </Card>
            <Card className="!py-3 !px-3">
              <CardContent className="!p-2 text-center">
                <div className="text-2xl font-bold text-accent">{stats.notifications.unread || 0}</div>
                <div className="text-xs text-muted-foreground">Unread Notifications</div>
              </CardContent>
            </Card>
            <Card className="!py-3 !px-3">
              <CardContent className="!p-2 text-center">
                <div className="text-2xl font-bold text-warning">{stats.progress.totalMilestones || 0}</div>
                <div className="text-xs text-muted-foreground">Total Milestones</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={18} />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Users:</span>
                    <span className="font-medium">{stats.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Admins:</span>
                    <span className="font-medium">{stats.users.admin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Regular Users:</span>
                    <span className="font-medium">{stats.users.regular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active (30d):</span>
                    <span className="font-medium">{stats.users.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New (30d):</span>
                    <span className="font-medium">{stats.users.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Week:</span>
                    <span className="font-medium">{stats.users.thisWeek}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy size={18} />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats.users.topPerformers || []).map((user, index) => (
                    <div key={user._id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.fullName}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{user.role}</Badge>
                        <span className="text-sm font-medium">{user['stats.reputation'] || 0} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crucible Tab */}
        <TabsContent value="crucible" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Problems Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={18} />
                  Problems Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.crucible.problems.total || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Problems</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Status</h4>
                  {(stats.crucible.problems.byStatus || []).map((status) => (
                    <div key={status._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{status._id || 'Unknown'}</span>
                      <Badge variant="secondary">{status.count}</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Difficulty</h4>
                  {(stats.crucible.problems.byDifficulty || []).map((difficulty) => (
                    <div key={difficulty._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{difficulty._id || 'Unknown'}</span>
                      <Badge variant="secondary">{difficulty.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Solutions Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={18} />
                  Solutions Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{stats.crucible.solutions.total || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Solutions</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Status</h4>
                  {(stats.crucible.solutions.byStatus || []).map((status) => (
                    <div key={status._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{status._id || 'Unknown'}</span>
                      <Badge variant="secondary">{status.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Problems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={18} />
                Top Problems by Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                                  {(stats.crucible.topProblems || []).map((problem, index) => (
                  <div key={problem._id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{problem.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{problem.difficulty}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{problem['metrics.attempts']}</div>
                        <div className="text-xs text-muted-foreground">Attempts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{problem['metrics.solutions']}</div>
                        <div className="text-xs text-muted-foreground">Solutions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forge Tab */}
        <TabsContent value="forge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resources Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame size={18} />
                  Resources Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{stats.forge.resources.total || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Resources</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Type</h4>
                  {(stats.forge.resources.byType || []).map((type) => (
                    <div key={type._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type._id || 'Unknown'}</span>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Category</h4>
                  {(stats.forge.resources.byCategory || []).map((category) => (
                    <div key={category._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{category._id || 'Unknown'}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={18} />
                  Top Resources by Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats.forge.topResources || []).map((resource, index) => (
                    <div key={resource._id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/20 text-warning text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{resource.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{resource['metrics.views']}</div>
                          <div className="text-xs text-muted-foreground">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{resource['metrics.bookmarks']}</div>
                          <div className="text-xs text-muted-foreground">Bookmarks</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channels Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={18} />
                  Channels Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-info">{stats.channels.total || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Channels</div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">By Type</h4>
                  {(stats.channels.byType || []).map((type) => (
                    <div key={type._id} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{type._id || 'Unknown'}</span>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Channels:</span>
                      <span className="font-medium">{stats.channels.active || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Messages:</span>
                      <span className="font-medium">{stats.channels.totalMessages || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} />
                  Recent Channels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats.channels.recent || []).map((channel, index) => (
                    <div key={channel._id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-info/20 text-info text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{channel.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{channel.createdBy?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(channel.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={18} />
                Activity Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.trends.daily || []).map((day) => (
                  <div key={day.date} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{day.users}</div>
                          <div className="text-xs text-muted-foreground">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{day.solutions}</div>
                          <div className="text-xs text-muted-foreground">Solutions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{day.resources}</div>
                          <div className="text-xs text-muted-foreground">Resources</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{day.messages}</div>
                          <div className="text-xs text-muted-foreground">Messages</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server size={18} />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Connections</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.systemHealth.databaseConnections}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response Time</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {stats.systemHealth.apiResponseTime}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sessions</span>
                    <span className="font-medium">{stats.systemHealth.activeSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Uptime</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.systemHealth.systemUptime}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(stats.systemHealth.lastBackup).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info size={18} />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(stats.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Models</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Endpoints</span>
                    <span className="font-medium">67</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Middleware</span>
                    <span className="font-medium">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage; 