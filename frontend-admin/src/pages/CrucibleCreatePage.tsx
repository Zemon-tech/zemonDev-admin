import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, ArrowRight, Plus, X, Tag, Book, Target, Users, Link2, MessageSquare, Trash2 } from 'lucide-react';

export interface ICrucibleProblemData {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    requirements: {
        functional: string[];
        nonFunctional: string[];
    };
    constraints: string[];
    expectedOutcome: string;
    hints: string[];
    learningObjectives: string[];
    prerequisites: string[];
    userPersonas: string[];
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
}

const CrucibleCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ICrucibleProblemData>({
        title: '',
        description: '',
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
    const [newResource, setNewResource] = useState({ title: '', url: '', type: 'article' as const });
    const [newAiHint, setNewAiHint] = useState({ trigger: '', content: '' });
    const [tagInput, setTagInput] = useState('');

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
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/crucible', formData);
            navigate('/admin/crucible');
        } catch (err) {
            console.error('Failed to create problem', err);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <Target size={16} /> },
        { id: 'requirements', label: 'Requirements', icon: <Book size={16} /> },
        { id: 'learning', label: 'Learning', icon: <Users size={16} /> },
        { id: 'resources', label: 'Resources', icon: <Link2 size={16} /> },
        { id: 'ai', label: 'AI Hints', icon: <MessageSquare size={16} /> },
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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-base-content">Create New Crucible Problem</h1>
                    <p className="text-sm text-base-content/70 mt-1">Create a new problem for users to solve</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/crucible')} 
                    className="btn btn-ghost btn-sm"
                >
                    Cancel
                </button>
            </div>
            
            {/* Main Card */}
            <div className="card bg-base-100 shadow-xl">
                {/* Tab Navigation */}
                <div className="border-b border-base-200">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button 
                                key={tab.id}
                                className={`
                                    flex items-center px-6 py-3 border-b-2 transition-colors duration-150
                                    hover:bg-base-200/50
                                    ${activeTab === tab.id 
                                        ? 'border-primary text-primary font-medium bg-base-200/30' 
                                        : 'border-transparent text-base-content/70 hover:text-primary hover:border-primary/30'
                                    }
                                `}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Info Tab */}
                    <div className={`space-y-6 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
                        {/* Title & Difficulty */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Title</span>
                                    <span className="label-text-alt text-error">Required</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    className="input input-bordered" 
                                    placeholder="Enter a descriptive title"
                                    required 
                                />
                                <label className="label">
                                    <span className="label-text-alt text-base-content/70">A clear, concise title for the problem</span>
                                </label>
                            </div>
                            
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Difficulty</span>
                                </label>
                                <select 
                                    name="difficulty" 
                                    value={formData.difficulty} 
                                    onChange={handleChange} 
                                    className="select select-bordered" 
                                    required
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="expert">Expert</option>
                                </select>
                                <label className="label">
                                    <span className="label-text-alt text-base-content/70">Select the problem's difficulty level</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                                <span className="label-text-alt text-error">Required</span>
                            </label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="textarea textarea-bordered min-h-[200px]" 
                                placeholder="Provide a detailed description of the problem..."
                                required 
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Describe the problem, context, and any important details</span>
                            </label>
                        </div>

                        {/* Expected Outcome */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Expected Outcome</span>
                                <span className="label-text-alt text-error">Required</span>
                            </label>
                            <textarea 
                                name="expectedOutcome" 
                                value={formData.expectedOutcome} 
                                onChange={handleChange} 
                                className="textarea textarea-bordered min-h-[120px]" 
                                placeholder="What should the solution accomplish?"
                                required 
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Clearly define what a successful solution looks like</span>
                            </label>
                        </div>

                        {/* Tags */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Tags</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, index) => (
                                    <div 
                                        key={index} 
                                        className="badge badge-primary gap-1 p-3"
                                    >
                                        {tag}
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveTag(index)}
                                            className="btn btn-ghost btn-xs px-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="join w-full">
                                <input 
                                    type="text" 
                                    value={tagInput} 
                                    onChange={(e) => setTagInput(e.target.value)} 
                                    className="input input-bordered join-item flex-1" 
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
                                    <Tag size={16} className="mr-1" /> Add
                                </button>
                            </div>
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Add tags to categorize and make the problem discoverable</span>
                            </label>
                        </div>
                    </div>

                    {/* Requirements Tab */}
                    <div className={`space-y-6 ${activeTab !== 'requirements' ? 'hidden' : ''}`}>
                        {/* Functional Requirements */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Functional Requirements</span>
                            </label>
                            <textarea 
                                value={formData.requirements.functional.join('\n')}
                                onChange={(e) => handleRequirementChange('functional', e.target.value)}
                                className="textarea textarea-bordered min-h-[200px] font-mono text-sm"
                                placeholder="Enter each requirement on a new line...
Example:
- User should be able to register with email and password
- System should send a verification email
- User should be able to reset password"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">These describe what the solution must do</span>
                            </label>
                        </div>

                        {/* Non-Functional Requirements */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Non-Functional Requirements</span>
                            </label>
                            <textarea 
                                value={formData.requirements.nonFunctional.join('\n')}
                                onChange={(e) => handleRequirementChange('nonFunctional', e.target.value)}
                                className="textarea textarea-bordered min-h-[200px] font-mono text-sm"
                                placeholder="Enter each requirement on a new line...
Example:
- Response time should be under 200ms
- System should handle 1000 concurrent users
- Password must be at least 8 characters long"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">These describe quality attributes like performance, security, etc.</span>
                            </label>
                        </div>

                        {/* Constraints */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Constraints</span>
                            </label>
                            <textarea 
                                value={formData.constraints.join('\n')}
                                onChange={(e) => handleListChange('constraints', e.target.value.split('\n').join(','))}
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm"
                                placeholder="Enter each constraint on a new line...
Example:
- Must use TypeScript
- No external libraries allowed
- Must follow REST principles"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">List any technical or business constraints that solutions must follow</span>
                            </label>
                        </div>
                    </div>

                    {/* Learning Tab */}
                    <div className={`space-y-6 ${activeTab !== 'learning' ? 'hidden' : ''}`}>
                        {/* Learning Objectives */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Learning Objectives</span>
                            </label>
                            <textarea 
                                value={formData.learningObjectives.join('\n')}
                                onChange={(e) => handleListChange('learningObjectives', e.target.value.split('\n').join(','))}
                                className="textarea textarea-bordered min-h-[200px] font-mono text-sm"
                                placeholder="Enter each learning objective on a new line...
Example:
- Understand REST API design principles
- Learn authentication best practices
- Master TypeScript generics
- Practice error handling patterns"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">What skills or knowledge will users gain from this problem?</span>
                            </label>
                        </div>

                        {/* Prerequisites */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Prerequisites</span>
                            </label>
                            <textarea 
                                value={formData.prerequisites.join('\n')}
                                onChange={(e) => handleListChange('prerequisites', e.target.value.split('\n').join(','))}
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm"
                                placeholder="Enter each prerequisite on a new line...
Example:
- Basic TypeScript knowledge
- Understanding of HTTP protocols
- Familiarity with Node.js
- Experience with databases"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">What should users already know before attempting this problem?</span>
                            </label>
                        </div>

                        {/* User Personas */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Target Users</span>
                            </label>
                            <textarea 
                                value={formData.userPersonas.join('\n')}
                                onChange={(e) => handleListChange('userPersonas', e.target.value.split('\n').join(','))}
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm"
                                placeholder="Enter each target user type on a new line...
Example:
- Junior Backend Developers
- Frontend Developers learning API design
- Full-stack developers
- DevOps engineers"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Who is this problem designed for?</span>
                            </label>
                        </div>

                        {/* Hints */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Solution Hints</span>
                            </label>
                            <textarea 
                                value={formData.hints.join('\n')}
                                onChange={(e) => handleListChange('hints', e.target.value.split('\n').join(','))}
                                className="textarea textarea-bordered min-h-[120px] font-mono text-sm"
                                placeholder="Enter each hint on a new line...
Example:
- Consider using a middleware for authentication
- Look into rate limiting for the API
- Think about error handling strategies"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">Optional hints to guide users who get stuck (these will be hidden by default)</span>
                            </label>
                        </div>
                    </div>

                    {/* Resources Tab */}
                    <div className={`space-y-6 ${activeTab !== 'resources' ? 'hidden' : ''}`}>
                        {/* Add Resource Form */}
                        <div className="card bg-base-200 p-6 rounded-xl">
                            <h2 className="text-lg font-medium mb-4 flex items-center">
                                <Link2 size={18} className="mr-2 text-primary" />
                                Add Learning Resource
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Title</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newResource.title} 
                                        onChange={e => setNewResource({...newResource, title: e.target.value})} 
                                        className="input input-bordered" 
                                        placeholder="e.g., TypeScript Handbook"
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">URL</span>
                                    </label>
                                    <input 
                                        type="url" 
                                        value={newResource.url} 
                                        onChange={e => setNewResource({...newResource, url: e.target.value})} 
                                        className="input input-bordered" 
                                        placeholder="https://..."
                                    />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Type</span>
                                    </label>
                                    <select 
                                        value={newResource.type} 
                                        onChange={e => setNewResource({...newResource, type: e.target.value as any})} 
                                        className="select select-bordered"
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
                        <div className="card bg-base-200 p-6 rounded-xl">
                            <h2 className="text-lg font-medium mb-4 flex items-center">
                                <Book size={18} className="mr-2 text-primary" />
                                Learning Resources
                            </h2>
                            
                            {formData.resources.length === 0 ? (
                                <div className="text-center py-8 text-base-content/70">
                                    <Book size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No resources added yet</p>
                                    <p className="text-sm mt-1">Add some helpful resources for users to learn from</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
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
                                                        <span className="badge badge-outline">
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
                                                            className="btn btn-ghost btn-xs text-error"
                                                        >
                                                            <Trash2 size={14} />
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
                    <div className={`space-y-6 ${activeTab !== 'ai' ? 'hidden' : ''}`}>
                        {/* Add AI Hint Form */}
                        <div className="card bg-base-200 p-6 rounded-xl">
                            <h2 className="text-lg font-medium mb-4 flex items-center">
                                <MessageSquare size={18} className="mr-2 text-primary" />
                                Add AI Hint
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Trigger Phrase</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={newAiHint.trigger} 
                                        onChange={e => setNewAiHint({...newAiHint, trigger: e.target.value})} 
                                        className="input input-bordered" 
                                        placeholder="e.g., How do I handle authentication?"
                                    />
                                    <label className="label">
                                        <span className="label-text-alt text-base-content/70">The question or phrase that will trigger this hint</span>
                                    </label>
                                </div>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Response Content</span>
                                    </label>
                                    <textarea 
                                        value={newAiHint.content} 
                                        onChange={e => setNewAiHint({...newAiHint, content: e.target.value})} 
                                        className="textarea textarea-bordered min-h-[104px]" 
                                        placeholder="Write a helpful response that guides without giving away the solution..."
                                    />
                                    <label className="label">
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
                        <div className="card bg-base-200 p-6 rounded-xl">
                            <h2 className="text-lg font-medium mb-4 flex items-center">
                                <MessageSquare size={18} className="mr-2 text-primary" />
                                AI Hints List
                            </h2>
                            
                            {formData.aiHints.length === 0 ? (
                                <div className="text-center py-8 text-base-content/70">
                                    <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No AI hints added yet</p>
                                    <p className="text-sm mt-1">Add some helpful hints for the AI to assist users</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
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
                                                            className="btn btn-ghost btn-xs text-error"
                                                        >
                                                            <Trash2 size={14} />
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

                    {/* Form Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-base-200">
                        <div className="flex gap-2">
                            {activeTab !== tabs[0].id && (
                                <button 
                                    type="button" 
                                    onClick={() => navigateTab('prev')} 
                                    className="btn btn-outline btn-sm"
                                >
                                    <ArrowLeft size={16} className="mr-1" /> Previous
                                </button>
                            )}
                            {activeTab !== tabs[tabs.length - 1].id && (
                                <button 
                                    type="button" 
                                    onClick={() => navigateTab('next')} 
                                    className="btn btn-outline btn-sm"
                                >
                                    Next <ArrowRight size={16} className="ml-1" />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} className="mr-2" /> Create Problem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrucibleCreatePage; 