import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFetch } from '../hooks/useFetch';
import type { ICrucibleProblemData } from './CrucibleCreatePage'; // Re-using interface

const CrucibleEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: problem, isLoading, error } = useFetch<ICrucibleProblemData>(`/crucible/${id}`);

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

    useEffect(() => {
        if (problem) {
            setFormData({
                ...problem,
                // Ensure all new fields exist even if they're not in the fetched data
                learningObjectives: problem.learningObjectives || [],
                prerequisites: problem.prerequisites || [],
                userPersonas: problem.userPersonas || [],
                resources: problem.resources || [],
                aiHints: problem.aiHints || [],
                status: problem.status || 'draft',
            });
        }
    }, [problem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'tags' | 'constraints' | 'hints' | 'learningObjectives' | 'prerequisites' | 'userPersonas', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()).filter(Boolean) }));
    };

    const handleRequirementChange = (type: 'functional' | 'nonFunctional', value: string) => {
        setFormData(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [type]: value.split('\n').filter(Boolean) }
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
            await api.put(`/crucible/${id}`, formData);
            navigate('/admin/crucible');
        } catch (err) {
            console.error('Failed to update problem', err);
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Crucible Problem</h1>
                <button onClick={() => navigate('/admin/crucible')} className="btn btn-ghost">
                    Cancel
                </button>
            </div>
            
            <div className="tabs tabs-boxed mb-6">
                <button 
                    className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`} 
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Info
                </button>
                <button 
                    className={`tab ${activeTab === 'requirements' ? 'tab-active' : ''}`} 
                    onClick={() => setActiveTab('requirements')}
                >
                    Requirements
                </button>
                <button 
                    className={`tab ${activeTab === 'learning' ? 'tab-active' : ''}`} 
                    onClick={() => setActiveTab('learning')}
                >
                    Learning
                </button>
                <button 
                    className={`tab ${activeTab === 'resources' ? 'tab-active' : ''}`} 
                    onClick={() => setActiveTab('resources')}
                >
                    Resources
                </button>
                <button 
                    className={`tab ${activeTab === 'ai' ? 'tab-active' : ''}`} 
                    onClick={() => setActiveTab('ai')}
                >
                    AI Hints
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                {/* Basic Info Tab */}
                <div className={`space-y-4 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Title</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" required />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Difficulty</span></label>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="select select-bordered" required>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Description</span></label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-32" required />
                    </div>
                    
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Tags (comma-separated)</span></label>
                        <input type="text" name="tags" value={formData.tags.join(', ')} onChange={e => handleListChange('tags', e.target.value)} className="input input-bordered" />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Expected Outcome</span></label>
                        <textarea name="expectedOutcome" value={formData.expectedOutcome} onChange={handleChange} className="textarea textarea-bordered" required />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Status</span></label>
                        <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered" required>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Requirements Tab */}
                <div className={`space-y-4 ${activeTab !== 'requirements' ? 'hidden' : ''}`}>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Functional Requirements (one per line)</span></label>
                        <textarea 
                            value={formData.requirements.functional.join('\n')} 
                            onChange={e => handleRequirementChange('functional', e.target.value)} 
                            className="textarea textarea-bordered h-32" 
                            placeholder="Enter each requirement on a new line"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Non-Functional Requirements (one per line)</span></label>
                        <textarea 
                            value={formData.requirements.nonFunctional.join('\n')} 
                            onChange={e => handleRequirementChange('nonFunctional', e.target.value)} 
                            className="textarea textarea-bordered h-32" 
                            placeholder="Enter each requirement on a new line"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Constraints (comma-separated)</span></label>
                        <input 
                            type="text" 
                            value={formData.constraints.join(', ')} 
                            onChange={e => handleListChange('constraints', e.target.value)} 
                            className="input input-bordered" 
                            placeholder="Time limit, memory constraints, etc."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Hints (comma-separated)</span></label>
                        <input 
                            type="text" 
                            value={formData.hints.join(', ')} 
                            onChange={e => handleListChange('hints', e.target.value)} 
                            className="input input-bordered" 
                            placeholder="Helpful hints for solving the problem"
                        />
                    </div>
                </div>

                {/* Learning Tab */}
                <div className={`space-y-4 ${activeTab !== 'learning' ? 'hidden' : ''}`}>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Learning Objectives (comma-separated)</span></label>
                        <input 
                            type="text" 
                            value={formData.learningObjectives.join(', ')} 
                            onChange={e => handleListChange('learningObjectives', e.target.value)} 
                            className="input input-bordered" 
                            placeholder="What users will learn from this problem"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Prerequisites (comma-separated)</span></label>
                        <input 
                            type="text" 
                            value={formData.prerequisites.join(', ')} 
                            onChange={e => handleListChange('prerequisites', e.target.value)} 
                            className="input input-bordered" 
                            placeholder="Required knowledge or skills"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium">User Personas (comma-separated)</span></label>
                        <input 
                            type="text" 
                            value={formData.userPersonas.join(', ')} 
                            onChange={e => handleListChange('userPersonas', e.target.value)} 
                            className="input input-bordered" 
                            placeholder="Target audience for this problem"
                        />
                    </div>
                </div>

                {/* Resources Tab */}
                <div className={`space-y-4 ${activeTab !== 'resources' ? 'hidden' : ''}`}>
                    <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Add New Resource</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Title</span></label>
                                <input 
                                    type="text" 
                                    value={newResource.title} 
                                    onChange={e => setNewResource({...newResource, title: e.target.value})} 
                                    className="input input-bordered input-sm" 
                                    placeholder="Resource title"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">URL</span></label>
                                <input 
                                    type="text" 
                                    value={newResource.url} 
                                    onChange={e => setNewResource({...newResource, url: e.target.value})} 
                                    className="input input-bordered input-sm" 
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Type</span></label>
                                <select 
                                    value={newResource.type} 
                                    onChange={e => setNewResource({...newResource, type: e.target.value as any})} 
                                    className="select select-bordered select-sm"
                                >
                                    <option value="article">Article</option>
                                    <option value="video">Video</option>
                                    <option value="documentation">Documentation</option>
                                    <option value="tool">Tool</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <button type="button" onClick={handleAddResource} className="btn btn-primary btn-sm">
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
                                        <td colSpan={4} className="text-center py-4 text-gray-500">No resources added yet</td>
                                    </tr>
                                ) : (
                                    formData.resources.map((resource, index) => (
                                        <tr key={index}>
                                            <td>{resource.title}</td>
                                            <td>{resource.type}</td>
                                            <td className="truncate max-w-xs">{resource.url}</td>
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
                    <div className="bg-base-200 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Add New AI Hint</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                            <div className="form-control">
                                <label className="label"><span className="label-text">Trigger Phrase</span></label>
                                <input 
                                    type="text" 
                                    value={newAiHint.trigger} 
                                    onChange={e => setNewAiHint({...newAiHint, trigger: e.target.value})} 
                                    className="input input-bordered input-sm" 
                                    placeholder="When user asks about..."
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text">Content</span></label>
                                <textarea 
                                    value={newAiHint.content} 
                                    onChange={e => setNewAiHint({...newAiHint, content: e.target.value})} 
                                    className="textarea textarea-bordered textarea-sm" 
                                    placeholder="AI should respond with..."
                                />
                            </div>
                        </div>
                        <button type="button" onClick={handleAddAiHint} className="btn btn-primary btn-sm">
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
                                        <td colSpan={3} className="text-center py-4 text-gray-500">No AI hints added yet</td>
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

                <div className="flex justify-between mt-8">
                    <div className="flex space-x-2">
                        {activeTab !== 'basic' && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    const tabs = ['basic', 'requirements', 'learning', 'resources', 'ai'];
                                    const currentIndex = tabs.indexOf(activeTab);
                                    setActiveTab(tabs[currentIndex - 1]);
                                }} 
                                className="btn btn-outline"
                            >
                                Previous
                            </button>
                        )}
                        {activeTab !== 'ai' && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    const tabs = ['basic', 'requirements', 'learning', 'resources', 'ai'];
                                    const currentIndex = tabs.indexOf(activeTab);
                                    setActiveTab(tabs[currentIndex + 1]);
                                }} 
                                className="btn btn-outline"
                            >
                                Next
                            </button>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default CrucibleEditPage; 