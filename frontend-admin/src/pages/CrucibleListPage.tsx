import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Target, Clock, Users, TrendingUp, Eye, Award, Heart, BarChart3, ChevronDown, ChevronUp, Image, Star } from 'lucide-react';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface ICrucibleProblem {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    category: 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    learningObjectives?: string[];
    prerequisites?: { name: string; link?: string }[];
    estimatedTime?: number;
    metrics: {
        attempts: number;
        solutions: number;
        successRate: number;
    };
    createdAt: string;
    updatedAt: string;
}

const CrucibleListPage: React.FC = () => {
    const [problems, setProblems] = useState<ICrucibleProblem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [problemToDelete, setProblemToDelete] = useState<ICrucibleProblem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set());
    const apiFetch = useApi();
    const { setNavbarTitle, setNavbarActions } = useUIChrome();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await apiFetch('/crucible/problems');
                setProblems(data);
            } catch (err) {
                setError('Failed to fetch problems');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblems();
    }, [apiFetch]);

    useEffect(() => {
        setNavbarTitle(
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Target size={20} />
                </div>
                <div className="leading-tight">
                    <div className="text-lg font-semibold">Crucible Problems</div>
                    <div className="text-sm text-base-content/70">Manage coding challenges and learning problems</div>
                </div>
            </div>
        );
        setNavbarActions(
            <Link to="/admin/crucible/create" className="btn btn-primary btn-sm">
                <Plus size={16} className="mr-1" />
                Create Problem
            </Link>
        );

        return () => {
            setNavbarTitle(null);
            setNavbarActions(null);
        };
    }, []);

    const handleDelete = async () => {
        if (!problemToDelete) return;
        try {
            await apiFetch(`/crucible/problems/${problemToDelete._id}`, { method: 'DELETE' });
            setProblems(problems.filter(p => p._id !== problemToDelete._id));
            setProblemToDelete(null);
        } catch (err) {
            console.error('Failed to delete problem', err);
        }
    };

    const toggleExpanded = (problemId: string) => {
        const newExpanded = new Set(expandedProblems);
        if (newExpanded.has(problemId)) {
            newExpanded.delete(problemId);
        } else {
            newExpanded.add(problemId);
        }
        setExpandedProblems(newExpanded);
    };

    const filteredProblems = problems?.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty === filterDifficulty;
        const matchesCategory = filterCategory === 'all' || problem.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || problem.status === filterStatus;
        
        return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'draft': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'archived': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getDifficultyBadgeClass = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'hard': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'expert': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'algorithms': return 'bg-primary/10 text-primary hover:bg-primary/10';
            case 'system-design': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
            case 'web-development': return 'bg-accent/10 text-accent hover:bg-accent/10';
            case 'mobile-development': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'data-science': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'devops': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
            case 'frontend': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'backend': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    const getCategoryDisplayName = (category: string) => {
        switch (category) {
            case 'algorithms': return 'Algorithms';
            case 'system-design': return 'System Design';
            case 'web-development': return 'Web Development';
            case 'mobile-development': return 'Mobile Development';
            case 'data-science': return 'Data Science';
            case 'devops': return 'DevOps';
            case 'frontend': return 'Frontend';
            case 'backend': return 'Backend';
            default: return category;
        }
    };

    const getMetricsSummary = () => {
        const totalProblems = problems.length;
        const publishedProblems = problems.filter(p => p.status === 'published').length;
        const totalAttempts = problems.reduce((sum, p) => sum + p.metrics.attempts, 0);
        const totalSolutions = problems.reduce((sum, p) => sum + p.metrics.solutions, 0);
        const avgSuccessRate = problems.length > 0 
            ? Math.round(problems.reduce((sum, p) => sum + p.metrics.successRate, 0) / problems.length)
            : 0;
        const totalViews = totalAttempts * 2; // Estimate views as 2x attempts
        const totalLikes = Math.round(totalSolutions * 1.5); // Estimate likes as 1.5x solutions

        return { totalProblems, publishedProblems, totalAttempts, totalSolutions, avgSuccessRate, totalViews, totalLikes };
    };

    const truncateTitle = (title: string, maxLength: number = 40) => {
        // Remove any trailing "0" and trim whitespace
        const cleanTitle = title.replace(/\s*0$/, '').trim();
        return cleanTitle.length > maxLength ? `${cleanTitle.substring(0, maxLength)}...` : cleanTitle;
    };

    const calculateAnalytics = (problem: ICrucibleProblem) => {
        const views = problem.metrics.attempts * 2;
        const likes = Math.round(problem.metrics.solutions * 1.5);
        const engagementRate = problem.metrics.attempts > 0 ? Math.round((problem.metrics.solutions / problem.metrics.attempts) * 100) : 0;
        const avgTimeSpent = problem.estimatedTime || 30;
        const difficultyScore = {
            'easy': 1,
            'medium': 2,
            'hard': 3,
            'expert': 4
        }[problem.difficulty] || 2;
        
        const complexityScore = Math.round((difficultyScore * avgTimeSpent) / 10);
        
        return {
            views,
            likes,
            engagementRate,
            avgTimeSpent,
            complexityScore,
            daysSinceCreated: Math.floor((Date.now() - new Date(problem.createdAt).getTime()) / (1000 * 60 * 60 * 24))
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
                                <div className="text-sm font-bold text-primary">{metrics.totalProblems}</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                            <Target size={12} className="text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-green-600">{metrics.publishedProblems}</div>
                                <div className="text-xs text-muted-foreground">Published</div>
                            </div>
                            <Eye size={12} className="text-green-600" />
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
                                <div className="text-sm font-bold text-yellow-600">{metrics.totalAttempts}</div>
                                <div className="text-xs text-muted-foreground">Attempts</div>
                            </div>
                            <Users size={12} className="text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-purple-600">{metrics.totalSolutions}</div>
                                <div className="text-xs text-muted-foreground">Solutions</div>
                            </div>
                            <Award size={12} className="text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-green-600">{metrics.avgSuccessRate}%</div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                            </div>
                            <TrendingUp size={12} className="text-green-600" />
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
                                placeholder="Search by title or tags..." 
                                className="pl-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
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
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="algorithms">Algorithms</SelectItem>
                            <SelectItem value="system-design">System Design</SelectItem>
                            <SelectItem value="web-development">Web Development</SelectItem>
                            <SelectItem value="mobile-development">Mobile Development</SelectItem>
                            <SelectItem value="data-science">Data Science</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="backend">Backend</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Problems Table */}
            <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3 font-medium text-sm">Title</th>
                                <th className="text-left p-3 font-medium text-sm">Thumbnail</th>
                                <th className="text-left p-3 font-medium text-sm">Category</th>
                                <th className="text-left p-3 font-medium text-sm">Status</th>
                                <th className="text-left p-3 font-medium text-sm">Views</th>
                                <th className="text-left p-3 font-medium text-sm">Attempts</th>
                                <th className="text-left p-3 font-medium text-sm">Solutions</th>
                                <th className="text-left p-3 font-medium text-sm">Likes</th>
                                <th className="text-left p-3 font-medium text-sm">Success Rate</th>
                                <th className="text-left p-3 font-medium text-sm w-20">Details</th>
                                <th className="text-left p-3 font-medium text-sm w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProblems?.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="text-center py-8 text-muted-foreground">
                                        No problems found matching your filters
                                    </td>
                                </tr>
                            ) : (
                                filteredProblems?.map((problem: ICrucibleProblem) => {
                                    const analytics = calculateAnalytics(problem);
                                    return (
                                        <React.Fragment key={problem._id}>
                                            <tr className="border-t hover:bg-muted/30 transition-colors">
                                                <td className="p-3">
                                                    <div className="max-w-[200px]">
                                                        <div className="font-medium" title={problem.title}>
                                                            {truncateTitle(problem.title.replace(/\s*0$/, ''))}
                                                        </div>
                                                        {problem.estimatedTime && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                <Clock size={12} />
                                                                {problem.estimatedTime}min
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {problem.thumbnailUrl ? (
                                                        <img 
                                                            src={problem.thumbnailUrl} 
                                                            alt={problem.title}
                                                            className="w-12 h-12 object-cover rounded-md border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                            <Image size={16} className="text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="secondary" className={getCategoryBadgeClass(problem.category)}>
                                                        {getCategoryDisplayName(problem.category)}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant="secondary" className={getStatusBadgeClass(problem.status)}>
                                                        {problem.status}
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
                                                        <Users size={14} className="text-yellow-600" />
                                                        {problem.metrics.attempts}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Award size={14} className="text-purple-600" />
                                                        {problem.metrics.solutions}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Heart size={14} className="text-red-600" />
                                                        {analytics.likes}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <TrendingUp size={14} className="text-green-600" />
                                                        {problem.metrics.successRate}%
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        onClick={() => toggleExpanded(problem._id)}
                                                        className="w-full"
                                                    >
                                                        {expandedProblems.has(problem._id) ? (
                                                            <ChevronUp size={14} />
                                                        ) : (
                                                            <ChevronDown size={14} />
                                                        )}
                                                    </Button>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link to={`/admin/crucible/edit/${problem._id}`}>
                                                                <Edit size={14} />
                                                            </Link>
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            onClick={() => setProblemToDelete(problem)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Details Row */}
                                            {expandedProblems.has(problem._id) && (
                                                <tr>
                                                    <td colSpan={11} className="p-0">
                                                        <div className="bg-muted/20 border-t border-muted p-4">
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                {/* Problem Details */}
                                                                <div>
                                                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                        <BarChart3 size={16} className="text-primary" />
                                                                        Problem Details
                                                                    </h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div><strong>Full Title:</strong> {problem.title.replace(/\s*0$/, '')}</div>
                                                                        <div><strong>Description:</strong> {problem.description.substring(0, 150)}...</div>
                                                                        <div><strong>Difficulty:</strong> 
                                                                            <Badge variant="secondary" className={`ml-2 ${getDifficultyBadgeClass(problem.difficulty)}`}>
                                                                                {problem.difficulty}
                                                                            </Badge>
                                                                        </div>
                                                                        <div><strong>Estimated Time:</strong> {problem.estimatedTime || 30} minutes</div>
                                                                        <div><strong>Created:</strong> {new Date(problem.createdAt).toLocaleDateString()}</div>
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
                                                                        <div><strong>Complexity Score:</strong> {analytics.complexityScore}/10</div>
                                                                        <div><strong>Days Since Created:</strong> {analytics.daysSinceCreated} days</div>
                                                                        <div><strong>Avg Time Spent:</strong> {analytics.avgTimeSpent} min</div>
                                                                        <div><strong>Success Rate:</strong> {problem.metrics.successRate}%</div>
                                                                    </div>
                                                                </div>

                                                                {/* Tags */}
                                                                <div>
                                                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                                                        <Star size={16} className="text-primary" />
                                                                        Tags & Learning
                                                                    </h4>
                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <div className="text-sm font-medium mb-2">Tags:</div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {problem.tags.map((tag, index) => (
                                                                                    <Badge key={index} variant="outline" className="text-xs">
                                                                                        {tag}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        {problem.learningObjectives && problem.learningObjectives.length > 0 && (
                                                                            <div>
                                                                                <div className="text-sm font-medium mb-2">Learning Objectives:</div>
                                                                                <ul className="text-xs space-y-1">
                                                                                    {problem.learningObjectives.slice(0, 3).map((objective, index) => (
                                                                                        <li key={index} className="flex items-start gap-2">
                                                                                            <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                                                                            {objective}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
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
            {problemToDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Problem</h3>
                        <p className="py-4">Are you sure you want to delete "{problemToDelete.title}"?</p>
                        <p className="text-sm text-base-content/70 mb-4">This action cannot be undone.</p>
                        <div className="modal-action">
                            <button onClick={() => setProblemToDelete(null)} className="btn">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-error">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrucibleListPage; 