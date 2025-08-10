import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ArrowRight, X, MessageSquare, FileText, Layers, Sparkles, Book, CheckCircle2, Target, Tag } from 'lucide-react';
import { useApi } from '../lib/api';
import type { ICrucibleProblemData } from './CrucibleCreatePage';

const CrucibleEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiFetch = useApi();

    const [formData, setFormData] = useState<ICrucibleProblemData>({
        title: '',
        description: '',
        category: 'algorithms',
        difficulty: 'medium',
        tags: [],
        requirements: { functional: [], nonFunctional: [] },
        constraints: [],
        expectedOutcome: '',
        hints: [],
        learningObjectives: [],
        prerequisites: [],
        userPersonas: [],
        resources: [],
        aiHints: [],
        status: 'draft',
    });

    const [activeTab, setActiveTab] = useState<string>('basic');
    const [newResource, setNewResource] = useState<{ 
        title: string; 
        url: string; 
        type: 'article' | 'video' | 'documentation' | 'tool' | 'other'
    }>({ 
        title: '', 
        url: '', 
        type: 'article' 
    });
    const [newAiHint, setNewAiHint] = useState({ trigger: '', content: '' });
    const [tagInput, setTagInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <FileText size={16} /> },
        { id: 'requirements', label: 'Requirements', icon: <Layers size={16} /> },
        { id: 'learning', label: 'Learning', icon: <Sparkles size={16} /> },
        { id: 'resources', label: 'Resources', icon: <Book size={16} /> },
        { id: 'ai', label: 'AI Hints', icon: <MessageSquare size={16} /> },
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await apiFetch(`/crucible/problems/${id}`);
                setFormData({
                    ...data,
                    learningObjectives: data.learningObjectives || [],
                    prerequisites: data.prerequisites || [],
                    userPersonas: data.userPersonas || [],
                    resources: data.resources || [],
                    aiHints: data.aiHints || [],
                    status: data.status || 'draft',
                });
            } catch (err) {
                setError('Failed to fetch problem');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblem();
    }, [id, apiFetch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'constraints' | 'hints' | 'learningObjectives' | 'prerequisites' | 'userPersonas', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()).filter(Boolean) }));
    };

    const handleRequirementChange = (type: 'functional' | 'nonFunctional', value: string) => {
        setFormData(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [type]: value.split('\n').filter(Boolean) }
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleAddResource = () => {
        if (newResource.title && newResource.url) {
            setFormData(prev => ({
                ...prev,
                resources: [...prev.resources, { ...newResource }]
            }));
            setNewResource({ title: '', url: '', type: 'article' });
        }
    };

    const handleRemoveResource = (index: number) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleAddAiHint = () => {
        if (newAiHint.trigger && newAiHint.content) {
            setFormData(prev => ({
                ...prev,
                aiHints: [...prev.aiHints, { ...newAiHint }]
            }));
            setNewAiHint({ trigger: '', content: '' });
        }
    };

    const handleRemoveAiHint = (index: number) => {
        setFormData(prev => ({
            ...prev,
            aiHints: prev.aiHints.filter((_, i) => i !== index)
        }));
    };

    const navigateTab = (direction: 'next' | 'prev') => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (direction === 'next' && currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        } else if (direction === 'prev' && currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);
        try {
            await apiFetch(`/crucible/problems/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            navigate('/admin/crucible');
        } catch (err) {
            console.error('Failed to update problem', err);
            setSaveError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Page Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                            <Target size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium">Edit Problem</h1>
                            <p className="text-sm text-base-content/70">Update problem details and content</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/crucible')} 
                        className="btn btn-outline btn-sm"
                    >
                        Cancel
                    </button>
                </div>
                
                <div className="mt-4 flex items-center">
                    <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
                        {tabs.map((tab, index) => {
                            const currentIndex = tabs.findIndex(t => t.id === activeTab);
                            return (
                                <div 
                                    key={tab.id}
                                    className={`h-full transition-all duration-300 ${index <= currentIndex ? 'bg-primary' : 'bg-transparent'}`}
                                    style={{ width: `${100 / tabs.length}%`, float: 'left' }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Main Card */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                {/* Tab Navigation */}
                <div className="bg-base-100 border-b border-base-200 sticky top-0 z-10">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab, index) => (
                            <button 
                                key={tab.id}
                                className={`
                                    relative flex items-center gap-1.5 px-4 py-2.5 transition-all duration-200 text-sm
                                    ${activeTab === tab.id 
                                        ? 'text-primary font-medium' 
                                        : 'text-base-content/70 hover:text-primary hover:bg-base-200/50'
                                    }
                                `}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <div className={`rounded-full p-1 ${activeTab === tab.id ? 'bg-primary/10' : 'bg-base-200'}`}>
                                    {tab.icon}
                                </div>
                                <span>{tab.label}</span>
                                
                                {/* Active tab indicator */}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                                )}
                                
                                {/* Step indicator */}
                                <div className="ml-1">
                                    <div className={`rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px] 
                                        ${activeTab === tab.id 
                                            ? 'bg-primary text-white' 
                                            : 'bg-base-200 text-base-content/70'}`}>
                                        {index + 1}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {/* Basic Info Tab */}
                    <div className={`space-y-4 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <FileText size={14} className="text-primary" />
                                    <span className="label-text font-medium">Title</span>
                                    <span className="badge badge-xs badge-error">Required</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    placeholder="Enter a descriptive title"
                                    required 
                                />
                            </div>

                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Tag size={14} className="text-primary" />
                                    <span className="label-text font-medium">Category</span>
                                    <span className="badge badge-xs badge-error">Required</span>
                                </label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full" 
                                    required
                                >
                                    <option value="algorithms">Algorithms & Data Structures</option>
                                    <option value="system-design">System Architecture & Design</option>
                                    <option value="web-development">Full-Stack Web Development</option>
                                    <option value="mobile-development">Mobile App Development</option>
                                    <option value="data-science">Machine Learning & Data Science</option>
                                    <option value="devops">DevOps & Infrastructure</option>
                                    <option value="frontend">Frontend Development</option>
                                    <option value="backend">Backend & API Development</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Layers size={14} className="text-primary" />
                                    <span className="label-text font-medium">Difficulty</span>
                                    <span className="badge badge-xs badge-error">Required</span>
                                </label>
                                <select 
                                    name="difficulty" 
                                    value={formData.difficulty} 
                                    onChange={handleChange} 
                                    className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <FileText size={14} className="text-primary" />
                                <span className="label-text font-medium">Description</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <FileText size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    className="textarea textarea-bordered min-h-[200px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full pl-20" 
                                    placeholder="Provide a detailed description of the problem..."
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <X size={14} className="text-primary" />
                                <span className="label-text font-medium">Tags</span>
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="badge badge-primary gap-1">
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTag(index)} 
                                            className="btn btn-ghost btn-xs px-1 text-white hover:bg-transparent"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                                <div className="flex-1 min-w-[200px]">
                                    <input 
                                        type="text" 
                                        value={tagInput} 
                                        onChange={e => setTagInput(e.target.value)} 
                                        onKeyPress={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        className="input input-bordered input-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="Press Enter to add tag"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-primary" />
                                <span className="label-text font-medium">Expected Outcome</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <CheckCircle2 size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    name="expectedOutcome" 
                                    value={formData.expectedOutcome} 
                                    onChange={handleChange} 
                                    className="textarea textarea-bordered min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full pl-20" 
                                    placeholder="Describe what a successful solution should achieve..."
                                    required 
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">Define clear success criteria and expected results</span>
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label pb-1 flex items-center gap-2">
                                <FileText size={14} className="text-primary" />
                                <span className="label-text font-medium">Status</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </label>
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                required
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    {/* Requirements Tab */}
                    <div className={`space-y-4 ${activeTab !== 'requirements' ? 'hidden' : ''}`}>
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Functional Requirements</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Layers size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.requirements.functional.join('\n')} 
                                    onChange={e => handleRequirementChange('functional', e.target.value)} 
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y pl-20" 
                                    placeholder="Enter each requirement on a new line..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Non-Functional Requirements</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Layers size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.requirements.nonFunctional.join('\n')} 
                                    onChange={e => handleRequirementChange('nonFunctional', e.target.value)} 
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y pl-20" 
                                    placeholder="Enter each requirement on a new line..."
                                />
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Constraints</span>
                            </label>
                            <textarea 
                                value={formData.constraints.join('\n')} 
                                onChange={e => handleListChange('constraints', e.target.value.split('\n').join(','))} 
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                                placeholder="Enter each constraint on a new line..."
                            />
                        </div>
                    </div>

                    {/* Learning Tab */}
                    <div className={`space-y-4 ${activeTab !== 'learning' ? 'hidden' : ''}`}>
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                <span className="label-text font-medium">Learning Objectives</span>
                            </label>
                            <textarea 
                                value={formData.learningObjectives.join('\n')} 
                                onChange={e => handleListChange('learningObjectives', e.target.value.split('\n').join(','))} 
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                                placeholder="Enter each learning objective on a new line..."
                            />
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Book size={14} className="text-primary" />
                                <span className="label-text font-medium">Prerequisites</span>
                            </label>
                            <textarea 
                                value={formData.prerequisites.join('\n')} 
                                onChange={e => handleListChange('prerequisites', e.target.value.split('\n').join(','))} 
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                                placeholder="Enter each prerequisite on a new line..."
                            />
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <FileText size={14} className="text-primary" />
                                <span className="label-text font-medium">User Personas</span>
                            </label>
                            <textarea 
                                value={formData.userPersonas.join('\n')} 
                                onChange={e => handleListChange('userPersonas', e.target.value.split('\n').join(','))} 
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                                placeholder="Enter each user persona on a new line..."
                            />
                        </div>
                    </div>

                    {/* Resources Tab */}
                    <div className={`space-y-4 ${activeTab !== 'resources' ? 'hidden' : ''}`}>
                        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Book size={18} />
                                </div>
                                Add Learning Resource
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <FileText size={14} className="text-primary" />
                                        <span className="label-text font-medium">Title</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newResource.title} 
                                        onChange={e => setNewResource({...newResource, title: e.target.value})} 
                                        className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="e.g., TypeScript Handbook"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <Book size={14} className="text-primary" />
                                        <span className="label-text font-medium">URL</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newResource.url} 
                                        onChange={e => setNewResource({...newResource, url: e.target.value})} 
                                        className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <FileText size={14} className="text-primary" />
                                        <span className="label-text font-medium">Type</span>
                                    </label>
                                    <select 
                                        value={newResource.type} 
                                        onChange={e => setNewResource({...newResource, type: e.target.value as 'article' | 'video' | 'documentation' | 'tool' | 'other'})} 
                                        className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    >
                                        <option value="article">Article</option>
                                        <option value="video">Video</option>
                                        <option value="documentation">Documentation</option>
                                        <option value="tool">Tool</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddResource} 
                                className="btn btn-primary btn-sm mt-4"
                                disabled={!newResource.title || !newResource.url}
                            >
                                Add Resource
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>URL</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.resources.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-4 text-base-content/70">No resources added yet</td>
                                        </tr>
                                    ) : (
                                        formData.resources.map((resource, index) => (
                                            <tr key={index}>
                                                <td>{resource.title}</td>
                                                <td><span className="badge badge-ghost capitalize">{resource.type}</span></td>
                                                <td className="truncate max-w-xs">
                                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                                        {resource.url}
                                                    </a>
                                                </td>
                                                <td>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveResource(index)} 
                                                        className="btn btn-ghost btn-xs text-error"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Hints Tab */}
                    <div className={`space-y-4 ${activeTab !== 'ai' ? 'hidden' : ''}`}>
                        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <MessageSquare size={18} />
                                </div>
                                Add AI Hint
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary" />
                                        <span className="label-text font-medium">Trigger Phrase</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newAiHint.trigger} 
                                        onChange={e => setNewAiHint({...newAiHint, trigger: e.target.value})} 
                                        className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="When user asks about..."
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary" />
                                        <span className="label-text font-medium">Content</span>
                                    </label>
                                    <textarea 
                                        value={newAiHint.content} 
                                        onChange={e => setNewAiHint({...newAiHint, content: e.target.value})} 
                                        className="textarea textarea-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                                        placeholder="AI should respond with..."
                                    />
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={handleAddAiHint} 
                                className="btn btn-primary btn-sm mt-4"
                                disabled={!newAiHint.trigger || !newAiHint.content}
                            >
                                Add AI Hint
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full">
                                <thead>
                                    <tr>
                                        <th>Trigger</th>
                                        <th>Content</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.aiHints.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-base-content/70">No AI hints added yet</td>
                                        </tr>
                                    ) : (
                                        formData.aiHints.map((hint, index) => (
                                            <tr key={index}>
                                                <td className="truncate max-w-xs">{hint.trigger}</td>
                                                <td className="truncate max-w-xs">{hint.content}</td>
                                                <td>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveAiHint(index)} 
                                                        className="btn btn-ghost btn-xs text-error"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-base-200">
                        <div className="flex gap-2">
                            {activeTab !== tabs[0].id && (
                                <button 
                                    type="button" 
                                    onClick={() => navigateTab('prev')} 
                                    className="btn btn-outline border-base-300 hover:bg-base-200 hover:border-base-300 gap-2"
                                >
                                    <ArrowLeft size={16} /> Previous
                                </button>
                            )}
                            {activeTab !== tabs[tabs.length - 1].id && (
                                <button 
                                    type="button" 
                                    onClick={() => navigateTab('next')} 
                                    className="btn btn-primary btn-outline gap-2"
                                >
                                    Next <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary gap-2" 
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                    
                    {saveError && (
                        <div className="alert alert-error mt-4">
                            {saveError}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CrucibleEditPage; 