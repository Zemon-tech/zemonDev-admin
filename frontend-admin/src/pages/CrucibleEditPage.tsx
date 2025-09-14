import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, MessageSquare, FileText, Layers, Sparkles, Book, CheckCircle2, Target, Tag, Link2, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../lib/api';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Separator } from '../components/ui/separator';
import { ImageUploadField } from '../components/common/ImageUploadField';
import type { ICrucibleProblemData } from './CrucibleCreatePage';

const CrucibleEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const apiFetch = useApi();
    const { setNavbarTitle, setNavbarActions, setTopbar } = useUIChrome();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [showAiPrompt, setShowAiPrompt] = useState(false);

    // Function to normalize requirements data (handle both old and new formats)
    const normalizeRequirements = (requirements: any) => {
        if (!requirements) return { functional: [], nonFunctional: [] };
        
        const normalizeArray = (arr: any[]): { requirement: string; context: string }[] => {
            if (!Array.isArray(arr)) return [];
            
            return arr.map(item => {
                if (typeof item === 'string') {
                    // Old format: string array
                    return { requirement: item, context: '' };
                } else if (item && typeof item === 'object' && 'requirement' in item) {
                    // New format: object with requirement and context
                    return {
                        requirement: item.requirement || '',
                        context: item.context || ''
                    };
                } else {
                    // Fallback
                    return { requirement: String(item), context: '' };
                }
            });
        };

        return {
            functional: normalizeArray(requirements.functional || []),
            nonFunctional: normalizeArray(requirements.nonFunctional || [])
        };
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <FileText size={16} /> },
        { id: 'requirements', label: 'Requirements', icon: <Layers size={16} /> },
        { id: 'learning', label: 'Learning', icon: <Sparkles size={16} /> },
        { id: 'resources', label: 'Resources & AI', icon: <Book size={16} /> },
        { id: 'advanced', label: 'Advanced', icon: <Layers size={16} /> },
        { id: 'json', label: 'Import JSON', icon: <FileText size={16} /> },
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const data = await apiFetch(`/crucible/problems/${id}`);
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    thumbnailUrl: data.thumbnailUrl || '',
                    category: data.category || 'algorithms',
                    difficulty: data.difficulty || 'medium',
                    tags: data.tags || [],
                    requirements: normalizeRequirements(data.requirements),
                    constraints: data.constraints || [],
                    expectedOutcome: data.expectedOutcome || '',
                    hints: data.hints || [],
                    learningObjectives: data.learningObjectives || [],
                    prerequisites: data.prerequisites || [],
                    userPersona: data.userPersona || { name: '', journey: '' },
                    resources: data.resources || [],
                    aiHints: data.aiHints || [],
                    status: data.status || 'published',
                    estimatedTime: data.estimatedTime ?? 0,
                    dataAssumptions: data.dataAssumptions || [],
                    edgeCases: data.edgeCases || [],
                    relatedResources: data.relatedResources || [],
                    subtasks: data.subtasks || [],
                    communityTips: data.communityTips || [],
                    aiPrompts: data.aiPrompts || [],
                    technicalParameters: data.technicalParameters || [],
                });
            } catch (err) {
                setError('Failed to fetch problem');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblem();
    }, [id, apiFetch]);

    useEffect(() => {
        setNavbarTitle(
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Target size={18} />
                </div>
                <div className="leading-tight">
                    <div className="text-sm font-medium">Edit Problem</div>
                    <div className="text-xs text-base-content/70">Update problem details and content</div>
                </div>
            </div>
        );
        setNavbarActions(
            <div className="flex items-center gap-2">
                <button 
                    type="button"
                    onClick={() => navigate('/admin/crucible')}
                    className="btn btn-ghost btn-sm"
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={() => (document.querySelector('#crucible-edit-form') as HTMLFormElement)?.requestSubmit()}
                    className="btn btn-primary btn-sm"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={14} /> Save Changes
                        </>
                    )}
                </button>
            </div>
        );
        setTopbar(
            <div className="flex overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm inline-flex items-center gap-2 transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'text-primary border-primary' : 'text-base-content/70 border-transparent hover:text-primary'}`}
                    >
                        <span className={`p-1 rounded ${activeTab === tab.id ? 'bg-primary/10' : 'bg-base-200'}`}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        );

        return () => {
            setNavbarTitle(null);
            setNavbarActions(null);
            setTopbar(null);
        };
    }, [activeTab, isSaving]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'constraints' | 'hints' | 'learningObjectives' | 'dataAssumptions' | 'edgeCases' | 'subtasks' | 'aiPrompts' | 'technicalParameters', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()).filter(Boolean) }));
    };

    const handleRequirementChange = (type: 'functional' | 'nonFunctional', value: string) => {
        // Parse the input to extract requirements and context
        const lines = value.split('\n').filter(Boolean);
        const requirements = lines.map(line => {
            // Check if line contains context (separated by | or : or -)
            const separator = line.includes('|') ? '|' : line.includes(':') ? ':' : line.includes('-') ? '-' : null;
            
            if (separator) {
                const parts = line.split(separator).map(part => part.trim());
                return {
                    requirement: parts[0],
                    context: parts.slice(1).join(separator).trim()
                };
            } else {
                return {
                    requirement: line.trim(),
                    context: ''
                };
            }
        });
        
        setFormData(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [type]: requirements }
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
        console.log('Edit form submitted with data:', formData);
        console.log('Updating problem with ID:', id);
        
        // Basic validation
        if (!formData.title.trim()) {
            setSaveError('Please enter a title for the problem');
            return;
        }
        if (!formData.description.trim()) {
            setSaveError('Please enter a description for the problem');
            return;
        }
        if (!formData.category) {
            setSaveError('Please select a category for the problem');
            return;
        }
        if (!formData.difficulty) {
            setSaveError('Please select a difficulty level');
            return;
        }
        
        setIsSaving(true);
        setSaveError(null);
        try {
            console.log('Sending PUT request to:', `/crucible/problems/${id}`);
            console.log('Request body:', formData);
            
            const response = await apiFetch(`/crucible/problems/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            console.log('Update success response:', response);
            console.log('Response type:', typeof response);
            console.log('Navigating to /admin/crucible...');
            setSaveError(null);
            setSaveSuccess(true);
            // Show success message briefly before navigating
            setTimeout(() => {
                navigate('/admin/crucible');
            }, 500);
            
            // Fallback navigation in case setTimeout fails
            setTimeout(() => {
                if (window.location.pathname.includes('/edit')) {
                    console.log('Fallback navigation triggered');
                    navigate('/admin/crucible');
                }
            }, 2000);
        } catch (err) {
            console.error('Failed to update problem', err);
            setSaveError(`Failed to save changes: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div className="w-full h-full">
            {/* Content */}
            <div className="px-2 md:px-4 pb-16">
                <form id="crucible-edit-form" onSubmit={handleSubmit} className="">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <ImageUploadField
                                    value={formData.thumbnailUrl || ''}
                                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                                    label="Thumbnail Image"
                                    placeholder="https://..."
                                    maxSizeKB={500}
                                    acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
                                    uploadType="crucible-thumbnail"
                                />
                                <label className="label pt-1">
                                    <span className="label-text-alt text-base-content/70">Only images (JPG, PNG, GIF, WebP) up to 500KB are allowed</span>
                                </label>
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
                                    value={formData.requirements.functional.map(req => `${req.requirement}${req.context ? ` | ${req.context}` : ''}`).join('\n')} 
                                    onChange={e => handleRequirementChange('functional', e.target.value)} 
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y pl-20" 
                                    placeholder="Enter each requirement on a new line (e.g., 'User can add a new task | As a user, I want to add a new task to the list')..."
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
                                    value={formData.requirements.nonFunctional.map(req => `${req.requirement}${req.context ? ` | ${req.context}` : ''}`).join('\n')} 
                                    onChange={e => handleRequirementChange('nonFunctional', e.target.value)} 
                                    className="textarea textarea-bordered min-h-[200px] font-mono text-sm w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y pl-20" 
                                    placeholder="Enter each requirement on a new line (e.g., 'Application must respond within 500ms | The system should handle 1000 concurrent users')..."
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
                                value={(formData.learningObjectives || []).join('\n')} 
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
                            <div className="space-y-3">
                                {(formData.prerequisites || []).map((p, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="input input-bordered" value={p.name} placeholder="Prerequisite name" onChange={(e) => setFormData(prev => { const next = [...(prev.prerequisites || [])]; next[idx] = { ...next[idx], name: e.target.value }; return { ...prev, prerequisites: next }; })} />
                                        <div className="flex gap-2">
                                            <input className="input input-bordered flex-1" value={p.link || ''} placeholder="Optional link" onChange={(e) => setFormData(prev => { const next = [...(prev.prerequisites || [])]; next[idx] = { ...next[idx], link: e.target.value }; return { ...prev, prerequisites: next }; })} />
                                            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setFormData(prev => ({ ...prev, prerequisites: (prev.prerequisites || []).filter((_, i) => i !== idx) }))}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({ ...prev, prerequisites: [...(prev.prerequisites || []), { name: '', link: '' }] }))}>Add prerequisite</button>
                            </div>
                        </div>

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                            <label className="label pb-1 flex items-center gap-2">
                                <FileText size={14} className="text-primary" />
                                <span className="label-text font-medium">User Persona</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="input input-bordered" placeholder="Persona name" value={formData.userPersona?.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, userPersona: { ...(prev.userPersona || { name: '', journey: '' }), name: e.target.value } }))} />
                                <input className="input input-bordered" placeholder="Persona journey" value={formData.userPersona?.journey || ''} onChange={(e) => setFormData(prev => ({ ...prev, userPersona: { ...(prev.userPersona || { name: '', journey: '' }), journey: e.target.value } }))} />
                            </div>
                        </div>
                    </div>

                    {/* Resources & AI Tab */}
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
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4">
                            <label className="label pb-1"><span className="label-text font-medium">Related Resources</span></label>
                            <div className="space-y-3">
                                {(formData.relatedResources || []).map((r, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="input input-bordered" value={r.title} placeholder="Title" onChange={(e) => setFormData(prev => { const next = [...(prev.relatedResources || [])]; next[idx] = { ...next[idx], title: e.target.value }; return { ...prev, relatedResources: next }; })} />
                                        <div className="flex gap-2">
                                            <input className="input input-bordered flex-1" value={r.link} placeholder="https://..." onChange={(e) => setFormData(prev => { const next = [...(prev.relatedResources || [])]; next[idx] = { ...next[idx], link: e.target.value }; return { ...prev, relatedResources: next }; })} />
                                            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setFormData(prev => ({ ...prev, relatedResources: (prev.relatedResources || []).filter((_, i) => i !== idx) }))}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({ ...prev, relatedResources: [...(prev.relatedResources || []), { title: '', link: '' }] }))}>Add related resource</button>
                            </div>
                        </div>

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

                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4">
                            <label className="label pb-1"><span className="label-text font-medium">Community Tips</span></label>
                            <div className="space-y-3">
                                {(formData.communityTips || []).map((t, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input className="input input-bordered" value={t.content} placeholder="Tip content" onChange={(e) => setFormData(prev => { const next = [...(prev.communityTips || [])]; next[idx] = { ...next[idx], content: e.target.value }; return { ...prev, communityTips: next }; })} />
                                        <div className="flex gap-2">
                                            <input className="input input-bordered flex-1" value={t.author || ''} placeholder="Author (optional)" onChange={(e) => setFormData(prev => { const next = [...(prev.communityTips || [])]; next[idx] = { ...next[idx], author: e.target.value }; return { ...prev, communityTips: next }; })} />
                                            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setFormData(prev => ({ ...prev, communityTips: (prev.communityTips || []).filter((_, i) => i !== idx) }))}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormData(prev => ({ ...prev, communityTips: [...(prev.communityTips || []), { content: '', author: '' }] }))}>Add tip</button>
                            </div>
                        </div>
                    </div>

                    {/* JSON Import Tab */}
                    <div className={`space-y-4 ${activeTab !== 'json' ? 'hidden' : ''}`}>
                        <div>
                            <h2 className="text-base font-medium">Import from JSON</h2>
                            <p className="text-sm text-base-content/70">Paste JSON exported/generated by AI to prefill this form</p>
                        </div>
                        <Separator />
                        
                        {/* AI Prompt Section */}
                        <div className="bg-base-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-medium">AI Prompt for Problem Generation</h3>
                                    <p className="text-xs text-base-content/70">Copy this prompt and use it with your AI assistant to generate problem content</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button"
                                        className="btn btn-ghost btn-xs"
                                        onClick={(event) => {
                                            const promptText = `Create a comprehensive coding problem in JSON format with the following structure and field descriptions:

{
  "title": "Problem title (required)",
  "description": "Detailed problem description explaining the challenge and context (required)",
  "thumbnailUrl": "Optional image URL for the problem",
  "category": "One of: algorithms, system-design, web-development, mobile-development, data-science, devops, frontend, backend",
  "difficulty": "One of: easy, medium, hard, expert",
  "tags": ["array", "of", "relevant", "tags"],
  "requirements": {
    "functional": [
      {
        "requirement": "What the solution must do (required)",
        "context": "Why this requirement exists or additional context (optional)"
      }
    ],
    "nonFunctional": [
      {
        "requirement": "Quality attributes like performance, security, etc. (required)",
        "context": "Specific details about the quality attribute (optional)"
      }
    ]
  },
  "constraints": ["Technical or business limitations"],
  "expectedOutcome": "Clear description of what a successful solution should achieve (required)",
  "hints": ["Helpful hints for solving the problem"],
  "learningObjectives": ["What learners should understand after solving"],
  "prerequisites": [
    {
      "name": "Required knowledge or skill",
      "link": "Optional resource link"
    }
  ],
  "userPersona": {
    "name": "Target user type",
    "journey": "User's learning journey context"
  },
  "resources": [
    {
      "title": "Resource title",
      "url": "Resource URL",
      "type": "One of: article, video, documentation, tool, other"
    }
  ],
  "aiHints": [
    {
      "trigger": "When to show this hint",
      "content": "Hint content"
    }
  ],
  "status": "One of: draft, published, archived",
  "estimatedTime": 120,
  "dataAssumptions": ["Assumptions about input data"],
  "edgeCases": ["Edge cases to consider"],
  "relatedResources": [
    {
      "title": "Related resource title",
      "link": "Resource link"
    }
  ],
  "subtasks": ["Break down into smaller tasks"],
  "communityTips": [
    {
      "content": "Tip from community",
      "author": "Tip author"
    }
  ],
  "aiPrompts": ["AI prompts for assistance"],
  "technicalParameters": ["Technical specifications"]
}

Field Descriptions:
- title: Clear, concise problem name
- description: Comprehensive explanation of the problem, including real-world context
- category: Problem type (algorithms, system-design, etc.)
- difficulty: Complexity level from easy to expert
- tags: Keywords for searchability and categorization
- requirements.functional: What the solution must accomplish (features, behaviors)
- requirements.nonFunctional: Quality attributes (performance, security, scalability, etc.)
- constraints: Technical limitations, business rules, or restrictions
- expectedOutcome: Success criteria and expected results
- hints: Progressive hints to guide problem-solving
- learningObjectives: Educational goals and takeaways
- prerequisites: Required knowledge, skills, or tools
- userPersona: Target audience and their context
- resources: Helpful materials, documentation, or tools
- aiHints: Contextual hints triggered by user actions
- estimatedTime: Expected time to complete (in minutes)
- dataAssumptions: Assumptions about input data or environment
- edgeCases: Boundary conditions and exceptional scenarios
- subtasks: Logical breakdown of the problem
- communityTips: Insights from experienced developers
- aiPrompts: Suggested prompts for AI assistance
- technicalParameters: Specific technical requirements or specifications

Generate a realistic, well-structured problem that provides clear learning value and practical application.`;
                                            navigator.clipboard.writeText(promptText);
                                            // Show a brief success message
                                            const button = event.target as HTMLButtonElement;
                                            const originalText = button.textContent;
                                            button.textContent = 'Copied!';
                                            button.className = 'btn btn-success btn-xs';
                                            setTimeout(() => {
                                                button.textContent = originalText;
                                                button.className = 'btn btn-ghost btn-xs';
                                            }, 2000);
                                        }}
                                    >
                                        Copy Prompt
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => setShowAiPrompt(!showAiPrompt)}
                                    >
                                        {showAiPrompt ? 'Hide' : 'Show'} Prompt
                                    </button>
                                </div>
                            </div>
                            {showAiPrompt && (
                                <div className="bg-base-300 rounded p-3">
                                    <pre className="text-xs text-base-content whitespace-pre-wrap">{`Create a comprehensive coding problem in JSON format with the following structure and field descriptions:

{
  "title": "Problem title (required)",
  "description": "Detailed problem description explaining the challenge and context (required)",
  "thumbnailUrl": "Optional image URL for the problem",
  "category": "One of: algorithms, system-design, web-development, mobile-development, data-science, devops, frontend, backend",
  "difficulty": "One of: easy, medium, hard, expert",
  "tags": ["array", "of", "relevant", "tags"],
  "requirements": {
    "functional": [
      {
        "requirement": "What the solution must do (required)",
        "context": "Why this requirement exists or additional context (optional)"
      }
    ],
    "nonFunctional": [
      {
        "requirement": "Quality attributes like performance, security, etc. (required)",
        "context": "Specific details about the quality attribute (optional)"
      }
    ]
  },
  "constraints": ["Technical or business limitations"],
  "expectedOutcome": "Clear description of what a successful solution should achieve (required)",
  "hints": ["Helpful hints for solving the problem"],
  "learningObjectives": ["What learners should understand after solving"],
  "prerequisites": [
    {
      "name": "Required knowledge or skill",
      "link": "Optional resource link"
    }
  ],
  "userPersona": {
    "name": "Target user type",
    "journey": "User's learning journey context"
  },
  "resources": [
    {
      "title": "Resource title",
      "url": "Resource URL",
      "type": "One of: article, video, documentation, tool, other"
    }
  ],
  "aiHints": [
    {
      "trigger": "When to show this hint",
      "content": "Hint content"
    }
  ],
  "status": "One of: draft, published, archived",
  "estimatedTime": 120,
  "dataAssumptions": ["Assumptions about input data"],
  "edgeCases": ["Edge cases to consider"],
  "relatedResources": [
    {
      "title": "Related resource title",
      "link": "Resource link"
    }
  ],
  "subtasks": ["Break down into smaller tasks"],
  "communityTips": [
    {
      "content": "Tip from community",
      "author": "Tip author"
    }
  ],
  "aiPrompts": ["AI prompts for assistance"],
  "technicalParameters": ["Technical specifications"]
}

Field Descriptions:
- title: Clear, concise problem name
- description: Comprehensive explanation of the problem, including real-world context
- category: Problem type (algorithms, system-design, etc.)
- difficulty: Complexity level from easy to expert
- tags: Keywords for searchability and categorization
- requirements.functional: What the solution must accomplish (features, behaviors)
- requirements.nonFunctional: Quality attributes (performance, security, scalability, etc.)
- constraints: Technical limitations, business rules, or restrictions
- expectedOutcome: Success criteria and expected results
- hints: Progressive hints to guide problem-solving
- learningObjectives: Educational goals and takeaways
- prerequisites: Required knowledge, skills, or tools
- userPersona: Target audience and their context
- resources: Helpful materials, documentation, or tools
- aiHints: Contextual hints triggered by user actions
- estimatedTime: Expected time to complete (in minutes)
- dataAssumptions: Assumptions about input data or environment
- edgeCases: Boundary conditions and exceptional scenarios
- subtasks: Logical breakdown of the problem
- communityTips: Insights from experienced developers
- aiPrompts: Suggested prompts for AI assistance
- technicalParameters: Specific technical requirements or specifications

Generate a realistic, well-structured problem that provides clear learning value and practical application.`}</pre>
                                </div>
                            )}
                        </div>
                        
                        <textarea 
                            value={jsonInput} 
                            onChange={(e) => { setJsonInput(e.target.value); setJsonError(null); }} 
                            className="textarea textarea-bordered min-h-[260px] font-mono text-xs w-full" 
                            placeholder="Paste your JSON here..."
                        />
                        {jsonError && <div className="alert alert-error text-sm">{jsonError}</div>}
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    try {
                                        const obj = JSON.parse(jsonInput || '{}');
                                        const next: any = {};
                                        const keys = ['title','description','thumbnailUrl','category','difficulty','tags','requirements','constraints','expectedOutcome','hints','learningObjectives','prerequisites','userPersona','resources','aiHints','status','estimatedTime','dataAssumptions','edgeCases','relatedResources','subtasks','communityTips','aiPrompts','technicalParameters'];
                                        keys.forEach(k => { if (obj[k] !== undefined) (next as any)[k] = obj[k]; });
                                        setFormData(prev => ({ ...prev, ...next }));
                                        setJsonError(null);
                                    } catch (e:any) {
                                        setJsonError(e.message || 'Invalid JSON');
                                    }
                                }}
                            >
                                Parse & Apply
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-outline btn-sm"
                                onClick={() => { setJsonInput(''); setJsonError(null); }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Error and Success Messages */}
                    {saveError && (
                        <div className="alert alert-error mt-4">
                            {saveError}
                        </div>
                    )}
                    
                    {saveSuccess && (
                        <div className="alert alert-success mt-4">
                            <CheckCircle2 size={16} />
                            Problem updated successfully! Redirecting...
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CrucibleEditPage; 