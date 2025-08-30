import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, MessageSquare, Users, TrendingUp, BarChart3, ChevronDown, ChevronUp, MessageCircle, Bell, Star, Shield, Hash, Eye} from 'lucide-react';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import FullScreenModal from '../components/common/FullScreenModal';
import AddChannelForm from '../components/channels/AddChannelForm';
import EditChannelModal from '../components/channels/EditChannelModal';

// Channel type based on backend model
interface Channel {
  _id: string;
  name: string;
  type: 'chat' | 'announcement' | 'showcase';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  moderators: string[];
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  parentChannelId?: string | null;
  children?: Channel[];
}

interface GroupedChannels {
  [group: string]: Array<Channel & { children?: Channel[] }>;
}

const groupNames: Record<string, string> = {
  'getting-started': 'Getting Started',
  'community': 'Community',
  'hackathons': 'Hackathons',
};

const ChannelsPage: React.FC = () => {
  const apiFetch = useApi();
  const { setNavbarTitle, setNavbarActions } = useUIChrome();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [grouped, setGrouped] = useState<GroupedChannels>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [analytics, setAnalytics] = useState<any>(null);

  // Fetch channels logic
  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/channels');
      setChannels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channels');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics logic
  const fetchAnalytics = async () => {
    try {
      const data = await apiFetch('/channels/analytics');
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFetch]);

  useEffect(() => {
    setNavbarTitle(
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <MessageSquare size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold">Channel Management</div>
          <div className="text-sm text-base-content/70">Manage communication channels and communities</div>
        </div>
      </div>
    );
    setNavbarActions(
      <Button onClick={() => setAddModalOpen(true)} size="sm" className="btn-primary">
        <Plus size={16} className="mr-1" />
        Create Channel
      </Button>
    );

    return () => {
      setNavbarTitle(null);
      setNavbarActions(null);
    };
  }, []);

  // Process channels into groups and parent-child structure
  useEffect(() => {
    const grouped: GroupedChannels = {
      'getting-started': [],
      'community': [],
      'hackathons': [],
    };
    // Map for quick parent lookup
    const idToParent: Record<string, Channel & { children?: Channel[] }> = {};
    channels.forEach((ch) => {
      if (ch.parentChannelId == null) {
        const parent = { ...ch, children: [] };
        grouped[ch.group].push(parent);
        idToParent[ch._id] = parent;
      }
    });
    channels.forEach((ch) => {
      if (ch.parentChannelId) {
        const parent = idToParent[ch.parentChannelId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(ch);
        }
      }
    });
    setGrouped(grouped);
  }, [channels]);

  // Delete logic
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await apiFetch(`/channels/${deleteTarget._id}`, { method: 'DELETE' });
      if (!deleteTarget.parentChannelId) {
        // Parent: remove parent and all its children
        setChannels((prev) => prev.filter(c => c._id !== deleteTarget._id && c.parentChannelId !== deleteTarget._id));
      } else {
        // Child: remove only the child
        setChannels((prev) => prev.filter(c => c._id !== deleteTarget._id));
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete channel');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpanded = (channelId: string) => {
    const newExpanded = new Set(expandedChannels);
    if (newExpanded.has(channelId)) {
      newExpanded.delete(channelId);
    } else {
      newExpanded.add(channelId);
    }
    setExpandedChannels(newExpanded);
  };

  const filteredChannels = channels?.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (channel.description && channel.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || channel.type === filterType;
    const matchesGroup = filterGroup === 'all' || channel.group === filterGroup;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' ? channel.isActive : !channel.isActive);
    
    return matchesSearch && matchesType && matchesGroup && matchesStatus;
  });

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'chat': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'announcement': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'showcase': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getGroupBadgeClass = (group: string) => {
    switch (group) {
      case 'getting-started': return 'bg-primary/10 text-primary hover:bg-primary/10';
      case 'community': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'hackathons': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusBadgeClass = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle size={14} />;
      case 'announcement': return <Bell size={14} />;
      case 'showcase': return <Star size={14} />;
      default: return <Hash size={14} />;
    }
  };

  const truncateName = (name: string, maxLength: number = 30) => {
    const cleanName = name.replace(/\s*0$/, '').trim();
    return cleanName.length > maxLength ? `${cleanName.substring(0, maxLength)}...` : cleanName;
  };

  const getMetricsSummary = () => {
    // Use real analytics data when available, fallback to calculated data
    if (analytics) {
      const chatChannels = analytics.channelsByType?.find((t: any) => t._id === 'chat')?.count || 0;
      const announcementChannels = analytics.channelsByType?.find((t: any) => t._id === 'announcement')?.count || 0;
      const showcaseChannels = analytics.channelsByType?.find((t: any) => t._id === 'showcase')?.count || 0;
      
      return { 
        totalChannels: analytics.totalChannels || 0, 
        activeChannels: analytics.activeChannels || 0, 
        chatChannels, 
        announcementChannels, 
        showcaseChannels, 
        parentChannels: analytics.parentChannels || 0, 
        childChannels: analytics.childChannels || 0, 
        totalModerators: analytics.totalModerators || 0, 
        recentChannels: analytics.recentChannels || 0
      };
    }

    // Fallback to calculated data
    const totalChannels = channels.length;
    const activeChannels = channels.filter(c => c.isActive).length;
    const chatChannels = channels.filter(c => c.type === 'chat').length;
    const announcementChannels = channels.filter(c => c.type === 'announcement').length;
    const showcaseChannels = channels.filter(c => c.type === 'showcase').length;
    const parentChannels = channels.filter(c => !c.parentChannelId).length;
    const childChannels = channels.filter(c => c.parentChannelId).length;
    const totalModerators = channels.reduce((sum, c) => sum + c.moderators.length, 0);
    const recentChannels = channels.filter(c => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated <= 30;
    }).length;

    return { 
      totalChannels, 
      activeChannels, 
      chatChannels, 
      announcementChannels, 
      showcaseChannels, 
      parentChannels, 
      childChannels, 
      totalModerators, 
      recentChannels 
    };
  };

  const calculateChannelAnalytics = (channel: Channel) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(channel.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceUpdated = Math.floor((Date.now() - new Date(channel.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    const isRecentlyCreated = daysSinceCreated <= 7;
    const isRecentlyUpdated = daysSinceUpdated <= 7;
    const hasChildren = channel.children && channel.children.length > 0;
    const childCount = channel.children ? channel.children.length : 0;
    
    return {
      daysSinceCreated,
      daysSinceUpdated,
      isRecentlyCreated,
      isRecentlyUpdated,
      hasChildren,
      childCount,
      moderatorCount: channel.moderators.length,
      isParent: !channel.parentChannelId
    };
  };

  const metrics = getMetricsSummary();

  if (loading) return (
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
                <div className="text-xs font-bold text-primary">{metrics.totalChannels}</div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
              <MessageSquare size={10} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-green-600">{metrics.activeChannels}</div>
                <div className="text-[10px] text-muted-foreground">Active</div>
              </div>
              <Eye size={10} className="text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-600">{metrics.chatChannels}</div>
                <div className="text-[10px] text-muted-foreground">Chat</div>
              </div>
              <MessageCircle size={10} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-yellow-600">{metrics.announcementChannels}</div>
                <div className="text-[10px] text-muted-foreground">Announce</div>
              </div>
              <Bell size={10} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-600">{metrics.showcaseChannels}</div>
                <div className="text-[10px] text-muted-foreground">Showcase</div>
              </div>
              <Star size={10} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 !py-2 !px-2">
          <CardContent className="!p-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-orange-600">{metrics.totalModerators}</div>
                <div className="text-[10px] text-muted-foreground">Moderators</div>
              </div>
              <Shield size={10} className="text-orange-600" />
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
                placeholder="Search by name or description..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="showcase">Showcase</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="getting-started">Getting Started</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="hackathons">Hackathons</SelectItem>
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

      {/* Channels Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-sm">Channel</th>
                <th className="text-left p-3 font-medium text-sm">Type</th>
                <th className="text-left p-3 font-medium text-sm">Group</th>
                <th className="text-left p-3 font-medium text-sm">Status</th>
                <th className="text-left p-3 font-medium text-sm">Moderators</th>
                <th className="text-left p-3 font-medium text-sm">Children</th>
                <th className="text-left p-3 font-medium text-sm">Created</th>
                <th className="text-left p-3 font-medium text-sm">Updated</th>
                <th className="text-left p-3 font-medium text-sm w-20">Details</th>
                <th className="text-left p-3 font-medium text-sm w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-muted-foreground">
                    No channels found matching your filters
                  </td>
                </tr>
              ) : (
                // Render parent channels first, then their children with indentation
                Object.entries(grouped).map(([, groupChannels]) => 
                  groupChannels.map((parentChannel) => {
                    const parentAnalytics = calculateChannelAnalytics(parentChannel);
                    return (
                      <React.Fragment key={parentChannel._id}>
                        {/* Parent Channel Row */}
                        <tr className="border-t hover:bg-muted/30 transition-colors bg-muted/10">
                          <td className="p-3">
                            <div className="max-w-[200px]">
                              <div className="font-medium flex items-center gap-2" title={parentChannel.name}>
                                <Hash size={14} className="text-primary" />
                                {truncateName(parentChannel.name)}
                              </div>
                              {parentChannel.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {parentChannel.description.length > 40 ? parentChannel.description.substring(0, 40) + '...' : parentChannel.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(parentChannel.type)}
                              <Badge variant="secondary" className={getTypeBadgeClass(parentChannel.type)}>
                                {parentChannel.type}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className={getGroupBadgeClass(parentChannel.group)}>
                              {groupNames[parentChannel.group]}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className={getStatusBadgeClass(parentChannel.isActive)}>
                              {parentChannel.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Shield size={14} className="text-orange-600" />
                              {parentAnalytics.moderatorCount}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Users size={14} className="text-blue-600" />
                              {parentAnalytics.childCount}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground">
                              {new Date(parentChannel.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground">
                              {new Date(parentChannel.updatedAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => toggleExpanded(parentChannel._id)}
                              className="w-full"
                            >
                              {expandedChannels.has(parentChannel._id) ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </Button>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => setEditTarget(parentChannel)}>
                                <Edit size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setDeleteTarget(parentChannel)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>

                                                 {/* Child Channels with Indentation */}
                         {parentChannel.children && parentChannel.children.map((childChannel) => {
                           const childAnalytics = calculateChannelAnalytics(childChannel);
                           return (
                             <React.Fragment key={childChannel._id}>
                               <tr className="border-t hover:bg-muted/20 transition-colors">
                                 <td className="p-3">
                                   <div className="max-w-[200px] pl-6 border-l-2 border-primary/30">
                                     <div className="font-medium flex items-center gap-2" title={childChannel.name}>
                                       <MessageCircle size={12} className="text-muted-foreground" />
                                       {truncateName(childChannel.name)}
                                     </div>
                                     {childChannel.description && (
                                       <div className="text-xs text-muted-foreground mt-1">
                                         {childChannel.description.length > 40 ? childChannel.description.substring(0, 40) + '...' : childChannel.description}
                                       </div>
                                     )}
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <div className="flex items-center gap-2">
                                     {getTypeIcon(childChannel.type)}
                                     <Badge variant="secondary" className={getTypeBadgeClass(childChannel.type)}>
                                       {childChannel.type}
                                     </Badge>
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <Badge variant="secondary" className={getGroupBadgeClass(childChannel.group)}>
                                     {groupNames[childChannel.group]}
                                   </Badge>
                                 </td>
                                 <td className="p-3">
                                   <Badge variant="secondary" className={getStatusBadgeClass(childChannel.isActive)}>
                                     {childChannel.isActive ? 'Active' : 'Inactive'}
                                   </Badge>
                                 </td>
                                 <td className="p-3">
                                   <div className="flex items-center gap-1 text-sm">
                                     <Shield size={14} className="text-orange-600" />
                                     {childAnalytics.moderatorCount}
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                     <Users size={14} className="text-muted-foreground" />
                                     -
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <div className="text-sm text-muted-foreground">
                                     {new Date(childChannel.createdAt).toLocaleDateString()}
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <div className="text-sm text-muted-foreground">
                                     {new Date(childChannel.updatedAt).toLocaleDateString()}
                                   </div>
                                 </td>
                                 <td className="p-3">
                                   <Button 
                                     size="sm" 
                                     variant="outline" 
                                     onClick={() => toggleExpanded(childChannel._id)}
                                     className="w-full"
                                   >
                                     {expandedChannels.has(childChannel._id) ? (
                                       <ChevronUp size={14} />
                                     ) : (
                                       <ChevronDown size={14} />
                                     )}
                                   </Button>
                                 </td>
                                 <td className="p-3">
                                   <div className="flex gap-1">
                                     <Button size="sm" variant="outline" onClick={() => setEditTarget(childChannel)}>
                                       <Edit size={14} />
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="outline" 
                                       onClick={() => setDeleteTarget(childChannel)}
                                       className="text-destructive hover:text-destructive"
                                     >
                                       <Trash2 size={14} />
                                     </Button>
                                   </div>
                                 </td>
                               </tr>

                               {/* Expanded Details Row for Child */}
                               {expandedChannels.has(childChannel._id) && (
                                 <tr>
                                   <td colSpan={10} className="p-0">
                                     <div className="bg-muted/10 border-t border-muted p-4 pl-10">
                                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                         {/* Channel Details */}
                                         <div>
                                           <h4 className="font-medium mb-3 flex items-center gap-2">
                                             <BarChart3 size={16} className="text-primary" />
                                             Child Channel Details
                                           </h4>
                                           <div className="space-y-2 text-sm">
                                             <div><strong>Full Name:</strong> {childChannel.name.replace(/\s*0$/, '')}</div>
                                             <div><strong>Description:</strong> {childChannel.description || 'No description'}</div>
                                             <div><strong>Type:</strong> 
                                               <Badge variant="secondary" className={`ml-2 ${getTypeBadgeClass(childChannel.type)}`}>
                                                 {childChannel.type}
                                               </Badge>
                                             </div>
                                             <div><strong>Group:</strong> 
                                               <Badge variant="secondary" className={`ml-2 ${getGroupBadgeClass(childChannel.group)}`}>
                                                 {groupNames[childChannel.group]}
                                               </Badge>
                                             </div>
                                             <div><strong>Status:</strong> 
                                               <Badge variant="secondary" className={`ml-2 ${getStatusBadgeClass(childChannel.isActive)}`}>
                                                 {childChannel.isActive ? 'Active' : 'Inactive'}
                                               </Badge>
                                             </div>
                                           </div>
                                         </div>

                                         {/* Analytics */}
                                         <div>
                                           <h4 className="font-medium mb-3 flex items-center gap-2">
                                             <TrendingUp size={16} className="text-primary" />
                                             Analytics
                                           </h4>
                                           <div className="space-y-2 text-sm">
                                             <div><strong>Days Since Created:</strong> {childAnalytics.daysSinceCreated} days</div>
                                             <div><strong>Days Since Updated:</strong> {childAnalytics.daysSinceUpdated} days</div>
                                             <div><strong>Recently Created:</strong> {childAnalytics.isRecentlyCreated ? 'Yes' : 'No'}</div>
                                             <div><strong>Recently Updated:</strong> {childAnalytics.isRecentlyUpdated ? 'Yes' : 'No'}</div>
                                             <div><strong>Parent Channel:</strong> {parentChannel.name}</div>
                                             <div><strong>Is Child Channel:</strong> Yes</div>
                                           </div>
                                         </div>

                                         {/* Permissions & Actions */}
                                         <div>
                                           <h4 className="font-medium mb-3 flex items-center gap-2">
                                             <Shield size={16} className="text-primary" />
                                             Permissions & Actions
                                           </h4>
                                           <div className="space-y-3">
                                             <div className="space-y-2 text-sm">
                                               <div><strong>Can Message:</strong> {childChannel.permissions.canMessage ? 'Yes' : 'No'}</div>
                                               <div><strong>Can Read:</strong> {childChannel.permissions.canRead ? 'Yes' : 'No'}</div>
                                               <div><strong>Moderators:</strong> {childAnalytics.moderatorCount}</div>
                                               <div><strong>Parent Channel:</strong> {parentChannel.name}</div>
                                             </div>
                                             <div className="space-y-2">
                                               <Button size="sm" variant="outline" onClick={() => setEditTarget(childChannel)} className="w-full">
                                                 <Edit size={14} className="mr-2" />
                                                 Edit Channel
                                               </Button>
                                             </div>
                                           </div>
                                         </div>
                                       </div>
                                     </div>
                                   </td>
                                 </tr>
                               )}
                             </React.Fragment>
                           );
                         })}

                        {/* Expanded Details Row for Parent */}
                        {expandedChannels.has(parentChannel._id) && (
                          <tr>
                            <td colSpan={10} className="p-0">
                              <div className="bg-muted/20 border-t border-muted p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                  {/* Channel Details */}
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <BarChart3 size={16} className="text-primary" />
                                      Channel Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Full Name:</strong> {parentChannel.name.replace(/\s*0$/, '')}</div>
                                      <div><strong>Description:</strong> {parentChannel.description || 'No description'}</div>
                                      <div><strong>Type:</strong> 
                                        <Badge variant="secondary" className={`ml-2 ${getTypeBadgeClass(parentChannel.type)}`}>
                                          {parentChannel.type}
                                        </Badge>
                                      </div>
                                      <div><strong>Group:</strong> 
                                        <Badge variant="secondary" className={`ml-2 ${getGroupBadgeClass(parentChannel.group)}`}>
                                          {groupNames[parentChannel.group]}
                                        </Badge>
                                      </div>
                                      <div><strong>Status:</strong> 
                                        <Badge variant="secondary" className={`ml-2 ${getStatusBadgeClass(parentChannel.isActive)}`}>
                                          {parentChannel.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Analytics */}
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <TrendingUp size={16} className="text-primary" />
                                      Analytics
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Days Since Created:</strong> {parentAnalytics.daysSinceCreated} days</div>
                                      <div><strong>Days Since Updated:</strong> {parentAnalytics.daysSinceUpdated} days</div>
                                      <div><strong>Recently Created:</strong> {parentAnalytics.isRecentlyCreated ? 'Yes' : 'No'}</div>
                                      <div><strong>Recently Updated:</strong> {parentAnalytics.isRecentlyUpdated ? 'Yes' : 'No'}</div>
                                      <div><strong>Has Children:</strong> {parentAnalytics.hasChildren ? 'Yes' : 'No'}</div>
                                      <div><strong>Child Channels:</strong> {parentAnalytics.childCount}</div>
                                    </div>
                                  </div>

                                  {/* Permissions & Actions */}
                                  <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                      <Shield size={16} className="text-primary" />
                                      Permissions & Actions
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Can Message:</strong> {parentChannel.permissions.canMessage ? 'Yes' : 'No'}</div>
                                        <div><strong>Can Read:</strong> {parentChannel.permissions.canRead ? 'Yes' : 'No'}</div>
                                        <div><strong>Moderators:</strong> {parentAnalytics.moderatorCount}</div>
                                        <div><strong>Parent Channel:</strong> {parentAnalytics.isParent ? 'Yes' : 'No'}</div>
                                      </div>
                                      <div className="space-y-2">
                                        <Button size="sm" variant="outline" onClick={() => setEditTarget(parentChannel)} className="w-full">
                                          <Edit size={14} className="mr-2" />
                                          Edit Channel
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full">
                                          <Plus size={14} className="mr-2" />
                                          Add Child Channel
                                        </Button>
                                      </div>
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
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <FullScreenModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Channel">
        <AddChannelForm onClose={() => setAddModalOpen(false)} onChannelAdded={fetchChannels} />
      </FullScreenModal>
      
      <EditChannelModal channel={editTarget} onClose={() => setEditTarget(null)} onChannelUpdated={fetchChannels} />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Channel</h3>
            <p className="py-4">
              {(!deleteTarget.parentChannelId)
                ? 'Deleting this parent channel will also delete all its child channels. This action cannot be undone.'
                : 'Are you sure you want to delete this channel?'}
            </p>
            {deleteError && <div className="alert alert-error mb-4">{deleteError}</div>}
            <div className="modal-action">
              <button onClick={() => setDeleteTarget(null)} className="btn" disabled={deleteLoading}>Cancel</button>
              <button onClick={handleDelete} className="btn btn-error" disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage; 