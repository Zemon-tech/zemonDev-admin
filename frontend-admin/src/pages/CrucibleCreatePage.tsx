import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../lib/api';
import { Save, Plus, X, Tag, Book, Target, Link2, MessageSquare, Trash2, Sparkles, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';

export interface ICrucibleProblemData {
    title: string;
    description: string;
    thumbnailUrl?: string;
    category: 'algorithms' | 'system-design' | 'web-development' | 'mobile-development' | 'data-science' | 'devops' | 'frontend' | 'backend';
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    tags: string[];
    requirements: {
        functional: { requirement: string; context: string }[];
        nonFunctional: { requirement: string; context: string }[];
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
    const { setNavbarTitle, setNavbarActions, setTopbar } = useUIChrome();
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
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [showAiPrompt, setShowAiPrompt] = useState(false);

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
        { id: 'json', label: 'Import JSON', icon: <FileText size={16} /> },
    ];



    useEffect(() => {
        setNavbarTitle(
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Target size={18} />
                </div>
                <div className="leading-tight">
                    <div className="text-sm font-medium">Create New Problem</div>
                    <div className="text-xs text-base-content/70">Add a new problem to the Crucible</div>
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
                    onClick={() => (document.querySelector('#crucible-create-form') as HTMLFormElement)?.requestSubmit()}
                    className="btn btn-primary btn-sm"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save size={14} /> Create Problem
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
    }, [activeTab, isSubmitting]);

    return (
        <div className="w-full h-full">

            {/* Content */}
            <div className="px-2 md:px-4 pb-16">
                <form id="crucible-create-form" onSubmit={handleSubmit} className="">
                    {/* Basic Info Tab */}
                    <div className={`space-y-4 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
                        {/* Title, Category & Difficulty */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium"><FileText size={14} className="text-primary" /> Title <span className="badge badge-xs badge-error">Required</span></Label>
                                <Input name="title" value={formData.title} onChange={handleChange} placeholder="Enter a descriptive title" required />
                                <div className="text-xs text-base-content/70">A clear, concise title for the problem</div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium"><Tag size={14} className="text-primary" /> Category <span className="badge badge-xs badge-error">Required</span></Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="algorithms">Algorithms & Data Structures</SelectItem>
                                        <SelectItem value="system-design">System Architecture & Design</SelectItem>
                                        <SelectItem value="web-development">Full-Stack Web Development</SelectItem>
                                        <SelectItem value="mobile-development">Mobile App Development</SelectItem>
                                        <SelectItem value="data-science">Machine Learning & Data Science</SelectItem>
                                        <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                                        <SelectItem value="frontend">Frontend Development</SelectItem>
                                        <SelectItem value="backend">Backend & API Development</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-base-content/70">Select the problem category</div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium"><Target size={14} className="text-primary" /> Difficulty</Label>
                                <RadioGroup value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { value: 'easy', label: 'Easy' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'hard', label: 'Hard' },
                                        { value: 'expert', label: 'Expert' },
                                    ].map(opt => (
                                        <Label key={opt.value} className={`cursor-pointer border rounded-md p-2.5 text-center ${formData.difficulty === opt.value ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                                            <div className="sr-only">
                                                <RadioGroupItem value={opt.value} />
                                            </div>
                                            <span className={`text-sm ${formData.difficulty === opt.value ? 'text-primary font-medium' : ''}`}>{opt.label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <div className="text-xs text-base-content/70">Select the problem's difficulty level</div>
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
                                <Textarea name="description" value={formData.description} onChange={handleChange} className="min-h-[200px]" placeholder="Provide a detailed description of the problem..." required />
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
                                <Input type="url" name="thumbnailUrl" value={formData.thumbnailUrl || ''} onChange={handleChange} placeholder="https://..." />
                            </div>
                            <div className="form-control">
                                <label className="label pb-1 flex items-center gap-2">
                                    <Layers size={14} className="text-primary" />
                                    <span className="label-text font-medium">Estimated Time (mins)</span>
                                </label>
                                <Input type="number" name="estimatedTime" value={formData.estimatedTime ?? 0} onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))} min={0} />
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
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(index)} className="btn btn-ghost btn-xs px-1">
                                            <X size={14} />
                                        </button>
                                    </Badge>
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
                        
                        <Textarea 
                            value={jsonInput} 
                            onChange={(e) => { setJsonInput(e.target.value); setJsonError(null); }} 
                            className="min-h-[260px] font-mono text-xs" 
                            placeholder="Paste your JSON here..." 
                        />
                        {jsonError && <div className="alert alert-error text-sm">{jsonError}</div>}
                        <div className="flex gap-2">
                            <Button type="button" onClick={() => {
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
                            }}>Parse & Apply</Button>
                            <Button type="button" variant="secondary" onClick={() => { setJsonInput(''); setJsonError(null); }}>Clear</Button>
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
                                <Textarea 
                                    value={formData.requirements.functional.map(r => `${r.requirement}${r.context ? ` | ${r.context}` : ''}`).join('\n')}
                                    onChange={(e) => handleRequirementChange('functional', e.target.value)}
                                    className="min-h-[200px] font-mono text-sm w-full"
                                    placeholder={`Enter each requirement on a new line...
Format: requirement | context
Example:
- User authentication | Must support OAuth2 and JWT tokens
- Data validation | All inputs must be sanitized and validated
- Error handling | Graceful error messages for all failure scenarios`}
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
                                <Textarea 
                                    value={formData.requirements.nonFunctional.map(r => `${r.requirement}${r.context ? ` | ${r.context}` : ''}`).join('\n')}
                                    onChange={(e) => handleRequirementChange('nonFunctional', e.target.value)}
                                    className="min-h-[200px] font-mono text-sm w-full"
                                    placeholder={`Enter each requirement on a new line...
Format: requirement | context
Example:
- Response time | Must be under 200ms for all API calls
- Scalability | System should handle 1000 concurrent users
- Security | Password must be at least 8 characters with complexity`}
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
                                <Textarea 
                                    value={formData.constraints.join('\n')}
                                    onChange={(e) => handleListChange('constraints', e.target.value.split('\n').join(','))}
                                    className="min-h-[120px] font-mono text-sm w-full"
                                    placeholder={`Enter each constraint on a new line...
Example:
- Must use TypeScript
- No external libraries allowed
- Must follow REST principles`}
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
                                <Textarea 
                                    value={formData.learningObjectives?.join('\n')}
                                    onChange={(e) => handleListChange('learningObjectives', e.target.value.split('\n').join(','))}
                                    className="min-h-[200px] font-mono text-sm w-full"
                                    placeholder={`Enter each learning objective on a new line...
Example:
- Understand REST API design principles
- Learn authentication best practices
- Master TypeScript generics
- Practice error handling patterns`}
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
                                <Textarea 
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
                                    className="min-h-[120px] font-mono text-sm w-full"
                                    placeholder={`Enter each prerequisite on a new line...
Example:
- Basic TypeScript knowledge
- Understanding of HTTP protocols
- Familiarity with Node.js
- Experience with databases`}
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
                                <Textarea 
                                    value={formData.userPersona?.name ? `${formData.userPersona.name} (${formData.userPersona.journey})` : ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        userPersona: e.target.value.trim() ? {
                                            name: e.target.value.split('(')[0].trim(),
                                            journey: e.target.value.split('(').length > 1 ? e.target.value.split('(')[1].replace(')', '').trim() : ''
                                        } : undefined
                                    }))}
                                    className="min-h-[120px] font-mono text-sm w-full"
                                    placeholder={`Enter the target user type and their journey...
Example:
- Junior Backend Developers (Building a new API)
- Frontend Developers learning API design (Learning about authentication)
- Full-stack developers (Building a complex application)
- DevOps engineers (Managing infrastructure)`}
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
                                <Textarea 
                                    value={formData.hints.join('\n')}
                                    onChange={(e) => handleListChange('hints', e.target.value.split('\n').join(','))}
                                    className="min-h-[120px] font-mono text-sm w-full"
                                    placeholder={`Enter each hint on a new line...
Example:
- Consider using a middleware for authentication
- Look into rate limiting for the API
- Think about error handling strategies`}
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
                                    <Input type="text" value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} placeholder="e.g., TypeScript Handbook" />
                                </div>
                                
                                <div className="form-control">
                                    <label className="label pb-1 flex items-center gap-2">
                                        <Link2 size={14} className="text-primary" />
                                        <span className="label-text font-medium">URL</span>
                                    </label>
                                    <Input type="url" value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} placeholder="https://..." />
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

                    {/* Form Actions now in Navbar */}
                </form>
            </div>
        </div>
    );
};

export default CrucibleCreatePage; 