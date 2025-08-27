import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../lib/api';
import { Save, ArrowLeft, ArrowRight, Plus, X, Tag, Book, Target, Link2, MessageSquare, Trash2, Sparkles, FileText, Layers, CheckCircle2 } from 'lucide-react';

export interface ICrucibleProblemData {
    title: string;
    description: string;
    thumbnailUrl?: string;
    category: 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    requirements: {
        functional: string[];
        nonFunctional: string[];
    };
    constraints: string[];
    expectedOutcome: string;
    hints: string[];
    learningObjectives?: string[];
    prerequisites?: { name: string; link?: string }[];
    userPersona?: { name: string; journey: string };
    resources: {
        title: string;
        url: string;
        type: 'article' | 'video' | 'documentation' | 'tool' | 'other';
    }[];
    aiHints: {
        trigger: string;
        content: string;
    }[];
    status: 'draft' | 'published' | 'archived';
    estimatedTime?: number;
    dataAssumptions?: string[];
    edgeCases?: string[];
    relatedResources?: { title: string; link: string }[];
    subtasks?: string[];
    communityTips?: { content: string; author?: string }[];
    aiPrompts?: string[];
    technicalParameters?: string[];
}

const CrucibleCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const apiFetch = useApi();
    const [formData, setFormData] = useState<ICrucibleProblemData>({
        title: '',
        description: '',
        thumbnailUrl: '',
        category: 'algorithms',
        difficulty: 'medium',
        tags: [],
        requirements: { functional: [], nonFunctional: [] },
        constraints: [],
        expectedOutcome: '',
        hints: [],
        learningObjectives: [],
        prerequisites: [],
        userPersona: { name: '', journey: '' },
        resources: [],
        aiHints: [],
        status: 'published',
        estimatedTime: 0,
        dataAssumptions: [],
        edgeCases: [],
        relatedResources: [],
        subtasks: [],
        communityTips: [],
        aiPrompts: [],
        technicalParameters: [],
    });

    const [activeTab, setActiveTab] = useState<string>('basic');
    const [newResource, setNewResource] = useState<{ title: string; url: string; type: 'article' | 'video' | 'documentation' | 'tool' | 'other' }>({ title: '', url: '', type: 'article' });
    const [newAiHint, setNewAiHint] = useState({ trigger: '', content: '' });
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'constraints' | 'hints' | 'learningObjectives' | 'dataAssumptions' | 'edgeCases' | 'subtasks' | 'aiPrompts' | 'technicalParameters', value: string) => {
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
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted with data:', formData);
        
        // Basic validation
        if (!formData.title.trim()) {
            alert('Please enter a title for the problem');
            return;
        }
        if (!formData.description.trim()) {
            alert('Please enter a description for the problem');
            return;
        }
        if (!formData.category) {
            alert('Please select a category for the problem');
            return;
        }
        if (!formData.difficulty) {
            alert('Please select a difficulty level');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await apiFetch('/crucible/problems', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            console.log('Success response:', response);
            navigate('/admin/crucible');
        } catch (err) {
            console.error('Failed to create problem', err);
            // Show error to user
            alert(`Failed to create problem: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <FileText size={16} /> },
        { id: 'requirements', label: 'Requirements', icon: <Layers size={16} /> },
        { id: 'learning', label: 'Learning', icon: <Sparkles size={16} /> },
        { id: 'resources', label: 'Resources', icon: <Book size={16} /> },
        { id: 'ai', label: 'AI Hints', icon: <MessageSquare size={16} /> },
        { id: 'advanced', label: 'Advanced', icon: <Layers size={16} /> },
    ];

    const navigateTab = (direction: 'next' | 'prev') => {
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (direction === 'next' && currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1].id);
        } else if (direction === 'prev' && currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1].id);
        }
    };

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
                            <h1 className="text-xl font-medium">Create New Problem</h1>
                            <p className="text-sm text-base-content/70">Add a new problem to the Crucible</p>
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
                        {/* Title, Category & Difficulty */}
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
                                <label className="label pt-1">
                                    <span className="label-text-alt text-base-content/70">A clear, concise title for the problem</span>
                                </label>
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
                                <label className="label pt-1">
                                    <span className="label-text-alt text-base-content/70">Select the problem category</span>
                                </label>
                            </div>
                            
                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Target size={14} className="text-primary" />
                                    <span className="label-text font-medium">Difficulty</span>
                                </label>
                                <div className="flex gap-2">
                                    <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                        ${formData.difficulty === 'easy' ? 'border-success bg-success/10' : 'border-base-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="difficulty" 
                                            value="easy" 
                                            checked={formData.difficulty === 'easy'} 
                                            onChange={handleChange} 
                                            className="absolute opacity-0" 
                                        />
                                        <span className={`relative z-10 text-sm ${formData.difficulty === 'easy' ? 'text-success font-medium' : ''}`}>Easy</span>
                                    </label>
                                    <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                        ${formData.difficulty === 'medium' ? 'border-warning bg-warning/10' : 'border-base-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="difficulty" 
                                            value="medium" 
                                            checked={formData.difficulty === 'medium'} 
                                            onChange={handleChange} 
                                            className="absolute opacity-0" 
                                        />
                                        <span className={`relative z-10 text-sm ${formData.difficulty === 'medium' ? 'text-warning font-medium' : ''}`}>Medium</span>
                                    </label>
                                    <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                        ${formData.difficulty === 'hard' ? 'border-error bg-error/10' : 'border-base-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="difficulty" 
                                            value="hard" 
                                            checked={formData.difficulty === 'hard'} 
                                            onChange={handleChange} 
                                            className="absolute opacity-0" 
                                        />
                                        <span className={`relative z-10 text-sm ${formData.difficulty === 'hard' ? 'text-error font-medium' : ''}`}>Hard</span>
                                    </label>
                                    <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                        ${formData.difficulty === 'expert' ? 'border-neutral bg-neutral/10' : 'border-base-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="difficulty" 
                                            value="expert" 
                                            checked={formData.difficulty === 'expert'} 
                                            onChange={handleChange} 
                                            className="absolute opacity-0" 
                                        />
                                        <span className={`relative z-10 text-sm ${formData.difficulty === 'expert' ? 'text-neutral font-medium' : ''}`}>Expert</span>
                                    </label>
                                </div>
                                <label className="label pt-1">
                                    <span className="label-text-alt text-base-content/70">Select the problem's difficulty level</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Description</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Layers size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    className="textarea textarea-bordered min-h-[200px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full" 
                                    placeholder="Provide a detailed description of the problem..."
                                    required 
                                />
                            </div>
                            <p className="text-xs text-base-content/70 mt-2 ml-1">
                                Describe the problem, context, and any important details
                            </p>
                        </div>

                        {/* Thumbnail URL and Estimated Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Link2 size={14} className="text-primary" />
                                    <span className="label-text font-medium">Thumbnail URL</span>
                                </label>
                                <input
                                    type="url"
                                    name="thumbnailUrl"
                                    value={formData.thumbnailUrl || ''}
                                    onChange={handleChange}
                                    className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Layers size={14} className="text-primary" />
                                    <span className="label-text font-medium">Estimated Time (mins)</span>
                                </label>
                                <input
                                    type="number"
                                    name="estimatedTime"
                                    value={formData.estimatedTime ?? 0}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                                    className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Expected Outcome */}
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
                                    className="textarea textarea-bordered min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full" 
                                    placeholder="What should the solution accomplish?"
                                    required 
                                />
                            </div>
                            <p className="text-xs text-base-content/70 mt-2 ml-1">
                                Clearly define what a successful solution looks like
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Tag size={14} className="text-primary" />
                                <span className="label-text font-medium">Tags</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-2 bg-base-200/50 rounded-md">
                                {formData.tags.length === 0 && 
                                    <span className="text-base-content/50 text-sm">No tags added yet</span>
                                }
                                {formData.tags.map((tag, index) => (
                                    <div 
                                        key={index} 
                                        className="badge badge-primary gap-1 p-3 bg-primary/10 text-primary border-primary/20"
                                    >
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTag(index)}
                                            className="btn btn-ghost btn-xs px-1 text-primary hover:bg-primary/20"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="join w-full mt-2">
                                <input 
                                    type="text" 
                                    value={tagInput} 
                                    onChange={(e) => setTagInput(e.target.value)} 
                                    className="input input-bordered join-item flex-1 focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                    placeholder="Add relevant tags..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddTag} 
                                    className="btn btn-primary join-item"
                                    disabled={!tagInput.trim()}
                                >
                                    <Plus size={16} className="mr-1" /> Add
                                </button>
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">Add tags to categorize and make the problem discoverable</span>
                            </label>
                        </div>
                    </div>

                    {/* Requirements Tab */}
                    <div className={`space-y-4 ${activeTab !== 'requirements' ? 'hidden' : ''}`}>
                        {/* Functional Requirements */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Functional Requirements</span>
                                <span className="badge badge-xs badge-primary">Core features</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Layers size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.requirements.functional.join('\n')}
                                    onChange={(e) => handleRequirementChange('functional', e.target.value)}
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each requirement on a new line...
Example:
- User should be able to register with email and password
- System should send a verification email
- User should be able to reset password"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">These describe what the solution must do</span>
                            </label>
                        </div>

                        {/* Non-Functional Requirements */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                <span className="label-text font-medium">Non-Functional Requirements</span>
                                <span className="badge badge-xs badge-secondary">Quality attributes</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Sparkles size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.requirements.nonFunctional.join('\n')}
                                    onChange={(e) => handleRequirementChange('nonFunctional', e.target.value)}
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each requirement on a new line...
Example:
- Response time should be under 200ms
- System should handle 1000 concurrent users
- Password must be at least 8 characters long"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">These describe quality attributes like performance, security, etc.</span>
                            </label>
                        </div>

                        {/* Constraints */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Target size={14} className="text-primary" />
                                <span className="label-text font-medium">Constraints</span>
                                <span className="badge badge-xs badge-accent">Limitations</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Target size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.constraints.join('\n')}
                                    onChange={(e) => handleListChange('constraints', e.target.value.split('\n').join(','))}
                                    className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each constraint on a new line...
Example:
- Must use TypeScript
- No external libraries allowed
- Must follow REST principles"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">List any technical or business constraints that solutions must follow</span>
                            </label>
                        </div>
                    </div>

                    {/* Learning Tab */}
                    <div className={`space-y-4 ${activeTab !== 'learning' ? 'hidden' : ''}`}>
                        {/* Learning Objectives */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                <span className="label-text font-medium">Learning Objectives</span>
                                <span className="badge badge-xs badge-primary">Skills & knowledge</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Sparkles size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.learningObjectives?.join('\n')}
                                    onChange={(e) => handleListChange('learningObjectives', e.target.value.split('\n').join(','))}
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each learning objective on a new line...
Example:
- Understand REST API design principles
- Learn authentication best practices
- Master TypeScript generics
- Practice error handling patterns"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">What skills or knowledge will users gain from this problem?</span>
                            </label>
                        </div>

                        {/* Prerequisites */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Book size={14} className="text-primary" />
                                <span className="label-text font-medium">Prerequisites</span>
                                <span className="badge badge-xs badge-secondary">Required knowledge</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Book size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.prerequisites?.map(p => `${p.name}${p.link ? ` (${p.link})` : ''}`).join('\n')}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        prerequisites: e.target.value.split('\n').map(item => {
                                            const parts = item.trim().split('(');
                                            const name = parts[0].trim();
                                            const link = parts.length > 1 ? parts[1].replace(')', '').trim() : undefined;
                                            return { name, link };
                                        }).filter(Boolean)
                                    }))}
                                    className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each prerequisite on a new line...
Example:
- Basic TypeScript knowledge
- Understanding of HTTP protocols
- Familiarity with Node.js
- Experience with databases"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">What should users already know before attempting this problem?</span>
                            </label>
                        </div>

                        {/* User Personas */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <Target size={14} className="text-primary" />
                                <span className="label-text font-medium">Target Users</span>
                                <span className="badge badge-xs badge-accent">Audience</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <Target size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.userPersona?.name ? `${formData.userPersona.name} (${formData.userPersona.journey})` : ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        userPersona: e.target.value.trim() ? {
                                            name: e.target.value.split('(')[0].trim(),
                                            journey: e.target.value.split('(').length > 1 ? e.target.value.split('(')[1].replace(')', '').trim() : ''
                                        } : undefined
                                    }))}
                                    className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter the target user type and their journey...
Example:
- Junior Backend Developers (Building a new API)
- Frontend Developers learning API design (Learning about authentication)
- Full-stack developers (Building a complex application)
- DevOps engineers (Managing infrastructure)"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">Who is this problem designed for?</span>
                            </label>
                        </div>

                        {/* Hints */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <MessageSquare size={14} className="text-primary" />
                                <span className="label-text font-medium">Solution Hints</span>
                                <span className="badge badge-xs badge-info">Help for users</span>
                            </label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <MessageSquare size={60} className="text-primary/10" />
                                </div>
                                <textarea 
                                    value={formData.hints.join('\n')}
                                    onChange={(e) => handleListChange('hints', e.target.value.split('\n').join(','))}
                                    className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y"
                                    placeholder="Enter each hint on a new line...
Example:
- Consider using a middleware for authentication
- Look into rate limiting for the API
- Think about error handling strategies"
                                />
                            </div>
                            <label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">Optional hints to guide users who get stuck (these will be hidden by default)</span>
                            </label>
                        </div>
                    </div>

                    {/* Resources Tab */}
                    <div className={`space-y-4 ${activeTab !== 'resources' ? 'hidden' : ''}`}>
                        {/* Add Resource Form */}
                        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Link2 size={18} />
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
                                        <Link2 size={14} className="text-primary" />
                                        <span className="label-text font-medium">URL</span>
                                    </label>
                                    <input 
                                        type="url" 
                                        value={newResource.url} 
                                        onChange={e => setNewResource({...newResource, url: e.target.value})} 
                                        className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="https://..."
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <Book size={14} className="text-primary" />
                                        <span className="label-text font-medium">Type</span>
                                    </label>
                                    <select 
                                        value={newResource.type} 
                                        onChange={e => setNewResource({...newResource, type: e.target.value as 'article' | 'video' | 'documentation' | 'tool' | 'other'})} 
                                        className="select select-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    >
                                        <option value="article">Article</option>
                                        <option value="video">Video Tutorial</option>
                                        <option value="documentation">Documentation</option>
                                        <option value="tool">Tool/Library</option>
                                        <option value="other">Other Resource</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button 
                                    type="button" 
                                    onClick={handleAddResource} 
                                    className="btn btn-primary btn-sm"
                                    disabled={!newResource.title || !newResource.url}
                                >
                                    <Plus size={16} className="mr-1" /> Add Resource
                                </button>
                            </div>
                        </div>

                        {/* Resource List */}
                        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Book size={18} />
                                </div>
                                Learning Resources
                            </h2>
                            
                            {formData.resources.length === 0 ? (
                                <div className="text-center py-8 text-base-content/70 bg-base-200/30 rounded-lg border border-dashed border-base-300">
                                    <Book size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No resources added yet</p>
                                    <p className="text-sm mt-1">Add some helpful resources for users to learn from</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-base-200">
                                    <table className="table w-full">
                                        <thead className="bg-base-200/50">
                                            <tr>
                                                <th>Title</th>
                                                <th>Type</th>
                                                <th>URL</th>
                                                <th className="w-20">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.resources.map((resource, index) => (
                                                <tr key={index} className="hover">
                                                    <td className="font-medium">{resource.title}</td>
                                                    <td>
                                                        <span className={`badge badge-sm ${
                                                            resource.type === 'article' ? 'badge-info' :
                                                            resource.type === 'video' ? 'badge-warning' :
                                                            resource.type === 'documentation' ? 'badge-success' :
                                                            resource.type === 'tool' ? 'badge-secondary' : 'badge-neutral'
                                                        }`}>
                                                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="font-mono text-sm">
                                                        <a 
                                                            href={resource.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="link link-primary"
                                                        >
                                                            {resource.url.length > 40 ? resource.url.substring(0, 40) + '...' : resource.url}
                                                        </a>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveResource(index)} 
                                                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Hints Tab */}
                    <div className={`space-y-4 ${activeTab !== 'ai' ? 'hidden' : ''}`}>
                        {/* Add AI Hint Form */}
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
                                        <Target size={14} className="text-primary" />
                                        <span className="label-text font-medium">Trigger Phrase</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newAiHint.trigger} 
                                        onChange={e => setNewAiHint({...newAiHint, trigger: e.target.value})} 
                                        className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="e.g., How do I handle authentication?"
                                    />
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-base-content/70">The question or phrase that will trigger this hint</span>
                                    </label>
                                </div>
                                
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary" />
                                        <span className="label-text font-medium">Response Content</span>
                                    </label>
                                    <textarea 
                                        value={newAiHint.content} 
                                        onChange={e => setNewAiHint({...newAiHint, content: e.target.value})} 
                                        className="textarea textarea-bordered min-h-[104px] focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                                        placeholder="Write a helpful response that guides without giving away the solution..."
                                    />
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-base-content/70">The AI's response when triggered</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button 
                                    type="button" 
                                    onClick={handleAddAiHint} 
                                    className="btn btn-primary btn-sm"
                                    disabled={!newAiHint.trigger || !newAiHint.content}
                                >
                                    <Plus size={16} className="mr-1" /> Add Hint
                                </button>
                            </div>
                        </div>

                        {/* AI Hints List */}
                        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <MessageSquare size={18} />
                                </div>
                                AI Hints List
                            </h2>
                            
                            {formData.aiHints.length === 0 ? (
                                <div className="text-center py-8 text-base-content/70 bg-base-200/30 rounded-lg border border-dashed border-base-300">
                                    <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No AI hints added yet</p>
                                    <p className="text-sm mt-1">Add some helpful hints for the AI to assist users</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-base-200">
                                    <table className="table w-full">
                                        <thead className="bg-base-200/50">
                                            <tr>
                                                <th>Trigger</th>
                                                <th>Response</th>
                                                <th className="w-20">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.aiHints.map((hint, index) => (
                                                <tr key={index} className="hover">
                                                    <td className="font-medium">{hint.trigger}</td>
                                                    <td className="whitespace-pre-wrap">
                                                        {hint.content.length > 100 
                                                            ? hint.content.substring(0, 100) + '...' 
                                                            : hint.content
                                                        }
                                                    </td>
                                                    <td>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveAiHint(index)} 
                                                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advanced Tab */}
                    <div className={`space-y-4 ${activeTab !== 'advanced' ? 'hidden' : ''}`}>
                        {/* Related Resources (title/link) */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4">
                            <label className="label pb-1 flex items-center gap-2">
                                <Link2 size={14} className="text-primary" />
                                <span className="label-text font-medium">Related Resources</span>
                            </label>
                            <div className="space-y-3">
                                {(formData.relatedResources || []).map((r, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            className="input input-bordered"
                                            value={r.title}
                                            placeholder="Title"
                                            onChange={(e) => setFormData(prev => {
                                                const next = [...(prev.relatedResources || [])];
                                                next[idx] = { ...next[idx], title: e.target.value };
                                                return { ...prev, relatedResources: next };
                                            })}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="input input-bordered flex-1"
                                                value={r.link}
                                                placeholder="https://..."
                                                onChange={(e) => setFormData(prev => {
                                                    const next = [...(prev.relatedResources || [])];
                                                    next[idx] = { ...next[idx], link: e.target.value };
                                                    return { ...prev, relatedResources: next };
                                                })}
                                            />
                                            <button type="button" className="btn btn-ghost" onClick={() => setFormData(prev => ({ ...prev, relatedResources: (prev.relatedResources || []).filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({ ...prev, relatedResources: [...(prev.relatedResources || []), { title: '', link: '' }] }))}>
                                    <Plus size={14} className="mr-1" /> Add related resource
                                </button>
                            </div>
                        </div>

                        {/* Data Assumptions, Edge Cases, Subtasks, AI Prompts, Technical Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: 'dataAssumptions', label: 'Data Assumptions' },
                                { key: 'edgeCases', label: 'Edge Cases' },
                                { key: 'subtasks', label: 'Subtasks' },
                                { key: 'aiPrompts', label: 'AI Prompts' },
                                { key: 'technicalParameters', label: 'Technical Parameters' },
                            ].map(({ key, label }) => (
                                <div key={key} className="form-control bg-base-100 rounded-lg border border-base-200 p-4">
                                    <label className="label pb-1"><span className="label-text font-medium">{label}</span></label>
                                    <textarea
                                        value={(formData as any)[key]?.join('\n') || ''}
                                        onChange={(e) => handleListChange(key as any, e.target.value.split('\n').join(','))}
                                        className="textarea textarea-bordered min-h-[120px] font-mono text-sm w-full"
                                        placeholder={`Enter each ${label.toLowerCase()} on a new line...`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Community Tips */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4">
                            <label className="label pb-1"><span className="label-text font-medium">Community Tips</span></label>
                            <div className="space-y-3">
                                {(formData.communityTips || []).map((t, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="input input-bordered" value={t.content} placeholder="Tip content" onChange={(e) => setFormData(prev => { const next = [...(prev.communityTips || [])]; next[idx] = { ...next[idx], content: e.target.value }; return { ...prev, communityTips: next }; })} />
                                        <div className="flex gap-2">
                                            <input className="input input-bordered flex-1" value={t.author || ''} placeholder="Author (optional)" onChange={(e) => setFormData(prev => { const next = [...(prev.communityTips || [])]; next[idx] = { ...next[idx], author: e.target.value }; return { ...prev, communityTips: next }; })} />
                                            <button type="button" className="btn btn-ghost" onClick={() => setFormData(prev => ({ ...prev, communityTips: (prev.communityTips || []).filter((_, i) => i !== idx) }))}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({ ...prev, communityTips: [...(prev.communityTips || []), { content: '', author: '' }] }))}>
                                    <Plus size={14} className="mr-1" /> Add tip
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Create Problem
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrucibleCreatePage; 