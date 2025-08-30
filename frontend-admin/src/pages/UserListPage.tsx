import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Users, UserCheck, UserX, Shield, Mail, Calendar, BarChart3, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const apiFetch = useApi();
  const { setNavbarTitle, setNavbarActions } = useUIChrome();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiFetch('/users');
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [apiFetch]);

  useEffect(() => {
    setNavbarTitle(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Users size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold">User Management</div>
          <div className="text-sm text-base-content/70">Manage system users and permissions</div>
        </div>
      </div>
    );
    setNavbarActions(
      <Link to="/admin/users/create" className="btn btn-primary btn-sm">
        <Plus size={16} className="mr-1" />
        Create User
      </Link>
    );

    return () => {
      setNavbarTitle(null);
      setNavbarActions(null);
    };
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiFetch(`/users/${userToDelete._id}`, { method: 'DELETE' });
      setUsers(users.filter((u: IUser) => u._id !== userToDelete._id));
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const toggleExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? user.isActive !== false : user.isActive === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'user': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusBadgeClass = (isActive: boolean | undefined) => {
    return isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const truncateName = (name: string, maxLength: number = 25) => {
    const cleanName = name.replace(/\s*0$/, '').trim();
    return cleanName.length > maxLength ? `${cleanName.substring(0, maxLength)}...` : cleanName;
  };

  const getMetricsSummary = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const inactiveUsers = users.filter(u => u.isActive === false).length;
    const recentUsers = users.filter(u => {
      if (!u.createdAt) return false;
      const daysSinceCreated = Math.floor((Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated <= 30;
    }).length;

    return { totalUsers, adminUsers, regularUsers, activeUsers, inactiveUsers, recentUsers };
  };

  const calculateUserAnalytics = (user: IUser) => {
    const daysSinceCreated = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const daysSinceLastLogin = user.lastLogin ? Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isRecentlyActive = daysSinceLastLogin !== null && daysSinceLastLogin <= 7;
    
    return {
      daysSinceCreated,
      daysSinceLastLogin,
      isRecentlyActive,
      status: user.isActive !== false ? 'Active' : 'Inactive'
    };
  };

  const metrics = getMetricsSummary();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error max-w-md mx-auto">
      <span>Error: {error}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <Card className="border-primary/20 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-primary">{metrics.totalUsers}</div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
              <Users size={10} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-green-600">{metrics.activeUsers}</div>
                <div className="text-[10px] text-muted-foreground">Active</div>
              </div>
              <UserCheck size={10} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-red-600">{metrics.adminUsers}</div>
                <div className="text-[10px] text-muted-foreground">Admins</div>
              </div>
              <Shield size={10} className="text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-600">{metrics.regularUsers}</div>
                <div className="text-[10px] text-muted-foreground">Users</div>
              </div>
              <Users size={10} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-600">{metrics.inactiveUsers}</div>
                <div className="text-[10px] text-muted-foreground">Inactive</div>
              </div>
              <UserX size={10} className="text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-600">{metrics.recentUsers}</div>
                <div className="text-[10px] text-muted-foreground">Recent</div>
              </div>
              <Calendar size={10} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search by name or email..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-sm">User</th>
                <th className="text-left p-3 font-medium text-sm">Avatar</th>
                <th className="text-left p-3 font-medium text-sm">Email</th>
                <th className="text-left p-3 font-medium text-sm">Role</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Last Login</th>
                <th className="text-left p-3 font-medium text-sm">Member Since</th>
                <th className="text-left p-3 font-medium text-sm w-20">Details</th>
                <th className="text-left p-3 font-medium text-sm w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    No users found matching your filters
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user: IUser) => {
                  const analytics = calculateUserAnalytics(user);
                  return (
                    <React.Fragment key={user._id}>
                      <tr className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="max-w-[200px]">
                            <div className="font-medium" title={user.fullName}>
                              {truncateName(user.fullName)}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail size={14} className="text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={getRoleBadgeClass(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={getStatusBadgeClass(user.isActive)}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-muted-foreground">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-muted-foreground">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleExpanded(user._id)}
                            className="w-full"
                          >
                            {expandedUsers.has(user._id) ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </Button>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/admin/users/edit/${user._id}`}>
                                <Edit size={14} />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setUserToDelete(user)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      {expandedUsers.has(user._id) && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div className="bg-muted/20 border-t border-muted p-4">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* User Details */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <BarChart3 size={16} className="text-primary" />
                                    User Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Full Name:</strong> {user.fullName.replace(/\s*0$/, '')}</div>
                                    <div><strong>Email:</strong> {user.email}</div>
                                    <div><strong>Role:</strong> 
                                      <Badge variant="secondary" className={`ml-2 ${getRoleBadgeClass(user.role)}`}>
                                        {user.role}
                                      </Badge>
                                    </div>
                                    <div><strong>Status:</strong> 
                                      <Badge variant="secondary" className={`ml-2 ${getStatusBadgeClass(user.isActive)}`}>
                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Analytics */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-primary" />
                                    Activity Analytics
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Days Since Created:</strong> {analytics.daysSinceCreated} days</div>
                                    <div><strong>Last Login:</strong> {analytics.daysSinceLastLogin !== null ? `${analytics.daysSinceLastLogin} days ago` : 'Never'}</div>
                                    <div><strong>Recently Active:</strong> {analytics.isRecentlyActive ? 'Yes' : 'No'}</div>
                                    <div><strong>Account Status:</strong> {analytics.status}</div>
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Shield size={16} className="text-primary" />
                                    Quick Actions
                                  </h4>
                                  <div className="space-y-2">
                                    <Button size="sm" variant="outline" asChild className="w-full">
                                      <Link to={`/admin/users/edit/${user._id}`}>
                                        <Edit size={14} className="mr-2" />
                                        Edit User
                                      </Link>
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full">
                                      <Mail size={14} className="mr-2" />
                                      Send Message
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">Are you sure you want to delete {userToDelete.fullName}?</p>
            <p className="text-sm text-base-content/70 mb-4">This action cannot be undone.</p>
            <div className="modal-action">
              <button onClick={() => setUserToDelete(null)} className="btn">Cancel</button>
              <button onClick={handleDelete} className="btn btn-error">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage; 