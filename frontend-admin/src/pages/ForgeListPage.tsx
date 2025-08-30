import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, TrendingUp, Eye, Heart, BarChart3, ChevronDown, ChevronUp, Image, Star, BookOpen, Link as LinkIcon } from 'lucide-react';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface IForgeResource {
    _id: string;
    title: string;
    type: string;
    url?: string;
    thumbnail?: string;
    difficulty: string;
    metrics?: {
        views: number;
        bookmarks: number;
        rating: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

const ForgeListPage: React.FC = () => {
    const [resources, setResources] = useState<IForgeResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resourceToDelete, setResourceToDelete] = useState<IForgeResource | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
    const apiFetch = useApi();
    const { setNavbarTitle, setNavbarActions } = useUIChrome();

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await apiFetch('/forge');
                setResources(data);
            } catch (err) {
                setError('Failed to fetch resources');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, [apiFetch]);

    useEffect(() => {
        setNavbarTitle(
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <BookOpen size={20} />
                </div>
                <div className="leading-tight">
                    <div className="text-lg font-semibold">Forge Resources</div>
                    <div className="text-sm text-base-content/70">Manage learning resources and tools</div>
                </div>
            </div>
        );
        setNavbarActions(
            <Link to="/admin/forge/create" className="btn btn-primary btn-sm">
                <Plus size={16} className="mr-1" />
                Create Resource
            </Link>
        );

        return () => {
            setNavbarTitle(null);
            setNavbarActions(null);
        };
    }, []);

    const handleDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await apiFetch(`/forge/${resourceToDelete._id}`, { method: 'DELETE' });
            setResources(resources.filter(r => r._id !== resourceToDelete._id));
            setResourceToDelete(null);
        } catch (err) {
            console.error('Failed to delete resource', err);
        }
    };

    const toggleExpanded = (resourceId: string) => {
        const newExpanded = new Set(expandedResources);
        if (newExpanded.has(resourceId)) {
            newExpanded.delete(resourceId);
        } else {
            newExpanded.add(resourceId);
        }
        setExpandedResources(newExpanded);
    };

    const filteredResources = resources?.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             resource.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;
        const matchesDifficulty = filterDifficulty === 'all' || resource.difficulty === filterDifficulty;
        
        return matchesSearch && matchesType && matchesDifficulty;
    });

    const getDifficultyBadgeClass = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'hard': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'expert': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'article': return 'bg-primary/10 text-primary hover:bg-primary/10';
            case 'video': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'documentation': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'tool': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'course': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const truncateTitle = (title: string, maxLength: number = 40) => {
        // Remove any trailing "0" and trim whitespace
        const cleanTitle = title.replace(/\s*0$/, '').trim();
        return cleanTitle.length > maxLength ? `${cleanTitle.substring(0, maxLength)}...` : cleanTitle;
    };

    const getMetricsSummary = () => {
        const totalResources = resources.length;
        const totalViews = resources.reduce((sum, r) => sum + (r.metrics?.views || 0), 0);
        const totalBookmarks = resources.reduce((sum, r) => sum + (r.metrics?.bookmarks || 0), 0);
        const avgRating = resources.length > 0 
            ? Math.round(resources.reduce((sum, r) => sum + (r.metrics?.rating || 0), 0) / resources.length * 10) / 10
            : 0;
        const totalLikes = Math.round(totalBookmarks * 1.2); // Estimate likes as 1.2x bookmarks
        const engagementRate = totalViews > 0 ? Math.round((totalBookmarks / totalViews) * 100) : 0;

        return { totalResources, totalViews, totalBookmarks, avgRating, totalLikes, engagementRate };
    };

    const calculateAnalytics = (resource: IForgeResource) => {
        const views = resource.metrics?.views || 0;
        const bookmarks = resource.metrics?.bookmarks || 0;
        const rating = resource.metrics?.rating || 0;
        const engagementRate = views > 0 ? Math.round((bookmarks / views) * 100) : 0;
        const estimatedLikes = Math.round(bookmarks * 1.2);
        
        return {
            views,
            bookmarks,
            rating,
            engagementRate,
            estimatedLikes,
            daysSinceCreated: resource.createdAt ? Math.floor((Date.now() - new Date(resource.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
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
                <Card className="border-primary/20">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-primary">{metrics.totalResources}</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <BookOpen size={12} className="text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-blue-600">{metrics.totalViews}</div>
                                <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                            <Eye size={12} className="text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-yellow-600">{metrics.totalBookmarks}</div>
                                <div className="text-xs text-muted-foreground">Bookmarks</div>
                            </div>
                            <Heart size={12} className="text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-purple-600">{metrics.totalLikes}</div>
                                <div className="text-xs text-muted-foreground">Likes</div>
                            </div>
                            <Heart size={12} className="text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-green-600">{metrics.avgRating}</div>
                                <div className="text-xs text-muted-foreground">Avg Rating</div>
                            </div>
                            <Star size={12} className="text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-info-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-info-600">{metrics.engagementRate}%</div>
                                <div className="text-xs text-muted-foreground">Engagement</div>
                            </div>
                            <TrendingUp size={12} className="text-info-600" />
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
                                placeholder="Search by title or type..." 
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
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="documentation">Documentation</SelectItem>
                            <SelectItem value="tool">Tool</SelectItem>
                            <SelectItem value="course">Course</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Resources Table */}
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3 font-medium text-sm">Title</th>
                                <th className="text-left p-3 font-medium text-sm">Thumbnail</th>
                                <th className="text-left p-3 font-medium text-sm">Type</th>
                                <th className="text-left p-3 font-medium text-sm">Difficulty</th>
                                <th className="text-left p-3 font-medium text-sm">Views</th>
                                <th className="text-left p-3 font-medium text-sm">Bookmarks</th>
                                <th className="text-left p-3 font-medium text-sm">Likes</th>
                                <th className="text-left p-3 font-medium text-sm">Rating</th>
                                <th className="text-left p-3 font-medium text-sm w-20">Details</th>
                                <th className="text-left p-3 font-medium text-sm w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResources?.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-8 text-muted-foreground">
                                        No resources found matching your filters
                                    </td>
                                </tr>
                            ) : (
                                filteredResources?.map((resource: IForgeResource) => {
                                    const analytics = calculateAnalytics(resource);
                                    return (
                                        <React.Fragment key={resource._id}>
                                            <tr className="border-t hover:bg-muted/30 transition-colors">
                                                <td className="p-3">
                                                    <div className="max-w-[200px]">
                                                        <div className="font-medium" title={resource.title}>
                                                            {truncateTitle(resource.title)}
                                                        </div>
                                                        {resource.url && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                <LinkIcon size={12} />
                                                                {resource.url.length > 30 ? resource.url.substring(0, 30) + '...' : resource.url}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {resource.thumbnail ? (
                                                        <img 
                                                            src={resource.thumbnail} 
                                                            alt={resource.title}
                                                            className="w-12 h-12 object-cover rounded-md border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                            <Image size={16} className="text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="secondary" className={getTypeBadgeClass(resource.type)}>
                                                        {resource.type}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="secondary" className={getDifficultyBadgeClass(resource.difficulty)}>
                                                        {resource.difficulty}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Eye size={14} className="text-blue-600" />
                                                        {analytics.views}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <BookOpen size={14} className="text-yellow-600" />
                                                        {analytics.bookmarks}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Heart size={14} className="text-red-600" />
                                                        {analytics.estimatedLikes}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Star size={14} className="text-green-600" />
                                                        {analytics.rating.toFixed(1)}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => toggleExpanded(resource._id)}
                                                        className="w-full"
                                                    >
                                                        {expandedResources.has(resource._id) ? (
                                                            <ChevronUp size={14} />
                                                        ) : (
                                                            <ChevronDown size={14} />
                                                        )}
                                                    </Button>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/admin/forge/edit/${resource._id}`}>
                                                                <Edit size={14} />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={() => setResourceToDelete(resource)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Details Row */}
                                            {expandedResources.has(resource._id) && (
                                                <tr>
                                                    <td colSpan={10} className="p-0">
                                                        <div className="bg-muted/20 border-t border-muted p-4">
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                {/* Resource Details */}
                                                                <div>
                                                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                        <BarChart3 size={16} className="text-primary" />
                                                                        Resource Details
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div><strong>Full Title:</strong> {resource.title.replace(/\s*0$/, '')}</div>
                                                                        <div><strong>Type:</strong> 
                                                                            <Badge variant="secondary" className={`ml-2 ${getTypeBadgeClass(resource.type)}`}>
                                                                                {resource.type}
                                                                            </Badge>
                                                                        </div>
                                                                        <div><strong>Difficulty:</strong> 
                                                                            <Badge variant="secondary" className={`ml-2 ${getDifficultyBadgeClass(resource.difficulty)}`}>
                                                                                {resource.difficulty}
                                                                            </Badge>
                                                                        </div>
                                                                        {resource.url && (
                                                                            <div><strong>URL:</strong> 
                                                                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                                                                                    {resource.url}
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                        {resource.createdAt && (
                                                                            <div><strong>Created:</strong> {new Date(resource.createdAt).toLocaleDateString()}</div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Analytics */}
                                                                <div>
                                                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                        <TrendingUp size={16} className="text-primary" />
                                                                        Analytics
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div><strong>Engagement Rate:</strong> {analytics.engagementRate}%</div>
                                                                        <div><strong>Days Since Created:</strong> {analytics.daysSinceCreated} days</div>
                                                                        <div><strong>Views:</strong> {analytics.views}</div>
                                                                        <div><strong>Bookmarks:</strong> {analytics.bookmarks}</div>
                                                                        <div><strong>Rating:</strong> {analytics.rating.toFixed(1)}/5</div>
                                                                    </div>
                                                                </div>

                                                                {/* Quick Actions */}
                                                                <div>
                                                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                        <Star size={16} className="text-primary" />
                                                                        Quick Actions
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {resource.url && (
                                                                            <Button size="sm" variant="outline" asChild className="w-full">
                                                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                                                    <Eye size={14} className="mr-2" />
                                                                                    View Resource
                                                                                </a>
                                                                            </Button>
                                                                        )}
                                                                        <Button size="sm" variant="outline" asChild className="w-full">
                                                                            <Link to={`/admin/forge/edit/${resource._id}`}>
                                                                                <Edit size={14} className="mr-2" />
                                                                                Edit Resource
                                                                            </Link>
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
            {resourceToDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Resource</h3>
                        <p className="py-4">Are you sure you want to delete "{resourceToDelete.title}"?</p>
                        <p className="text-sm text-base-content/70 mb-4">This action cannot be undone.</p>
                        <div className="modal-action">
                            <button onClick={() => setResourceToDelete(null)} className="btn">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-error">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgeListPage; 