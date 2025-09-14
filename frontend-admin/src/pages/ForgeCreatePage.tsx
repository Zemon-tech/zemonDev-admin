import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../lib/api';
import { Save, Plus, X, Tag, Flame, FileText, Code, Eye, Type, Image, Globe, Sparkles } from 'lucide-react';
import { useUIChrome } from '../components/layout/UIChromeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { ImageUploadField } from '../components/common/ImageUploadField';


export interface IForgeResourceData {
    title: string;
    type: 'article' | 'video' | 'documentation' | 'tool' | 'tutorial' | 'cheatsheet' | 'template' | 'other';
    url: string;
    thumbnail: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isExternal: boolean;
    content: string;
    contentType: 'markdown' | 'html' | 'text';
    category: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'database' | 'mobile' | 'ai-ml' | 'design' | 'general';
    estimatedTime?: number;
    prerequisites?: string[];
    learningOutcomes?: string[];
    relatedTechnologies?: string[];
    author?: string;
    version?: string;
    license?: string;
    status: 'draft' | 'published' | 'archived';
}

const ForgeCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const apiFetch = useApi();
    const { setNavbarTitle, setNavbarActions, setTopbar } = useUIChrome();
    const [formData, setFormData] = useState<IForgeResourceData>({
        title: '',
        type: 'article',
        url: '',
        thumbnail: '',
        description: '',
        tags: [],
        difficulty: 'intermediate',
        isExternal: true,
        content: '',
        contentType: 'markdown',
        category: 'general',
        estimatedTime: 0,
        prerequisites: [],
        learningOutcomes: [],
        relatedTechnologies: [],
        author: '',
        version: '1.0.0',
        license: 'MIT',
        status: 'published',
    });

    const [activeTab, setActiveTab] = useState<string>('basic');
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title.trim()) {
            alert('Please enter a title for the resource');
            return;
        }
        if (!formData.description.trim()) {
            alert('Please enter a description for the resource');
            return;
        }
        if (!formData.category) {
            alert('Please select a category for the resource');
            return;
        }
        if (!formData.difficulty) {
            alert('Please select a difficulty level');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiFetch('/forge', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            console.log('Success response:', response);
            navigate('/admin/forge');
        } catch (err) {
            console.error('Failed to create resource', err);
            alert(`Failed to create resource: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <FileText size={16} /> },
        { id: 'content', label: 'Content', icon: <Code size={16} /> },
    ];

    useEffect(() => {
        setNavbarTitle(
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-warning/10 text-warning rounded-lg">
                    <Flame size={18} />
                </div>
                <div className="leading-tight">
                    <div className="text-sm font-medium">Create New Resource</div>
                    <div className="text-xs text-base-content/70">Add a new resource to the Forge library</div>
                </div>
            </div>
        );
        setNavbarActions(
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => navigate('/admin/forge')}
                    className="btn btn-ghost btn-sm"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => (document.querySelector('#forge-create-form') as HTMLFormElement)?.requestSubmit()}
                    className="btn btn-warning btn-sm"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save size={14} /> Create Resource
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
                        className={`px-4 py-3 text-sm inline-flex items-center gap-2 transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'text-warning border-warning' : 'text-base-content/70 border-transparent hover:text-warning'}`}
                    >
                        <span className={`p-1 rounded ${activeTab === tab.id ? 'bg-warning/10' : 'bg-base-200'}`}>{tab.icon}</span>
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
                <form id="forge-create-form" onSubmit={handleSubmit} className="">
                    {/* Basic Info Tab */}
                    <div className={`space-y-4 ${activeTab !== 'basic' ? 'hidden' : ''}`}>
                        {/* Title, Type & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <FileText size={14} className="text-warning" />
                                    Title <span className="badge badge-xs badge-error">Required</span>
                                </Label>
                                <Input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter a descriptive title"
                                    required
                                />
                                <div className="text-xs text-base-content/70">A clear, concise title for the resource</div>
                            </div>

                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Type size={14} className="text-warning" />
                                    Type <span className="badge badge-xs badge-error">Required</span>
                                </Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select resource type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="article">Article</SelectItem>
                                        <SelectItem value="video">Video Tutorial</SelectItem>
                                        <SelectItem value="documentation">Documentation</SelectItem>
                                        <SelectItem value="tutorial">Step-by-Step Tutorial</SelectItem>
                                        <SelectItem value="cheatsheet">Cheat Sheet</SelectItem>
                                        <SelectItem value="template">Code Template</SelectItem>
                                        <SelectItem value="tool">Tool/Library</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-base-content/70">Select the resource type</div>
                            </div>

                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Tag size={14} className="text-warning" />
                                    Category
                                </Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="frontend">Frontend Development</SelectItem>
                                        <SelectItem value="backend">Backend Development</SelectItem>
                                        <SelectItem value="fullstack">Full-Stack Development</SelectItem>
                                        <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                                        <SelectItem value="database">Database & Data</SelectItem>
                                        <SelectItem value="mobile">Mobile Development</SelectItem>
                                        <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                                        <SelectItem value="design">Design & UX</SelectItem>
                                        <SelectItem value="general">General Programming</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-base-content/70">Select the resource category</div>
                            </div>
                        </div>

                        {/* Difficulty & External URL */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Sparkles size={14} className="text-warning" />
                                    Difficulty
                                </Label>
                                <RadioGroup value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value as any }))} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { value: 'beginner', label: 'Beginner' },
                                        { value: 'intermediate', label: 'Intermediate' },
                                        { value: 'advanced', label: 'Advanced' },
                                        { value: 'expert', label: 'Expert' },
                                    ].map(opt => (
                                        <Label key={opt.value} className={`cursor-pointer border rounded-md p-2.5 text-center ${formData.difficulty === opt.value ? 'border-warning bg-warning/5' : 'border-base-300'}`}>
                                            <div className="sr-only">
                                                <RadioGroupItem value={opt.value} />
                                            </div>
                                            <span className={`text-sm ${formData.difficulty === opt.value ? 'text-warning font-medium' : ''}`}>{opt.label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <div className="text-xs text-base-content/70">Select the resource's difficulty level</div>
                            </div>

                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Globe size={14} className="text-warning" />
                                    External URL
                                </Label>
                                <Input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                                <div className="text-xs text-base-content/70">External link to the resource (optional)</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-warning/30">
                            <Label className="label pb-1 flex items-center gap-2">
                                <FileText size={14} className="text-warning" />
                                <span className="label-text font-medium">Description</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </Label>
                            <div className="relative">
                                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                    <FileText size={60} className="text-warning/10" />
                                </div>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="min-h-[200px] pl-20"
                                    placeholder="Provide a detailed description of the resource..."
                                    required
                                />
                            </div>
                            <p className="text-xs text-base-content/70 mt-2 ml-1">
                                Describe what this resource covers and who it's for
                            </p>
                        </div>

                        {/* Thumbnail Upload and Estimated Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <ImageUploadField
                                    value={formData.thumbnail}
                                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                                    label="Thumbnail Image"
                                    placeholder="https://..."
                                    uploadType="forge-thumbnail"
                                    maxSizeKB={500}
                                    acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
                                />
                                <label className="label pt-1">
                                    <span className="label-text-alt text-base-content/70">Only images (JPG, PNG, GIF, WebP) up to 500KB are allowed</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <Label className="label pb-1 flex items-center gap-2">
                                    <Sparkles size={14} className="text-warning" />
                                    <span className="label-text font-medium">Estimated Time (mins)</span>
                                </Label>
                                <Input
                                    type="number"
                                    name="estimatedTime"
                                    value={formData.estimatedTime ?? 0}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: Number(e.target.value) }))}
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-warning/30">
                            <Label className="label pb-1 flex items-center gap-2">
                                <Tag size={14} className="text-warning" />
                                <span className="label-text font-medium">Tags</span>
                            </Label>
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
                                <Input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    className="join-item flex-1"
                                    placeholder="Add relevant tags..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="join-item"
                                    disabled={!tagInput.trim()}
                                >
                                    <Plus size={16} className="mr-1" /> Add
                                </Button>
                            </div>
                            <Label className="label pt-1">
                                <span className="label-text-alt text-base-content/70">Add tags to categorize and make the resource discoverable</span>
                            </Label>
                        </div>
                    </div>

                    {/* Content Tab */}
                    <div className={`space-y-4 ${activeTab !== 'content' ? 'hidden' : ''}`}>
                        {/* Content Type Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Code size={14} className="text-warning" />
                                    Content Type
                                </Label>
                                <RadioGroup value={formData.contentType} onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value as any }))} className="grid grid-cols-1 gap-2">
                                    {[
                                        { value: 'markdown', label: 'Markdown', icon: <FileText size={16} /> },
                                        { value: 'html', label: 'HTML', icon: <Code size={16} /> },
                                        { value: 'text', label: 'Plain Text', icon: <Type size={16} /> },
                                    ].map(opt => (
                                        <Label key={opt.value} className={`cursor-pointer border rounded-md p-3 flex items-center gap-3 ${formData.contentType === opt.value ? 'border-warning bg-warning/5' : 'border-base-300'}`}>
                                            <div className="sr-only">
                                                <RadioGroupItem value={opt.value} />
                                            </div>
                                            <span className={`p-1 rounded ${formData.contentType === opt.value ? 'bg-warning/10 text-warning' : 'bg-base-200'}`}>
                                                {opt.icon}
                                            </span>
                                            <span className={`text-sm ${formData.contentType === opt.value ? 'text-warning font-medium' : ''}`}>{opt.label}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                                <div className="text-xs text-base-content/70">Select the content format for this resource</div>
                            </div>

                            <div className="space-y-2">
                                <Label className="inline-flex items-center gap-2 text-sm font-medium">
                                    <Eye size={14} className="text-warning" />
                                    Preview Mode
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={showPreview ? "default" : "outline"}
                                        onClick={() => setShowPreview(true)}
                                        className="flex-1"
                                    >
                                        <Eye size={16} className="mr-2" /> Preview
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={!showPreview ? "default" : "outline"}
                                        onClick={() => setShowPreview(false)}
                                        className="flex-1"
                                    >
                                        <Code size={16} className="mr-2" /> Edit
                                    </Button>
                                </div>
                                <div className="text-xs text-base-content/70">Switch between edit and preview modes</div>
                            </div>
                        </div>

                        {/* Content Editor/Preview */}
                        <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-warning/30">
                            <Label className="label pb-1 flex items-center gap-2">
                                <Code size={14} className="text-warning" />
                                <span className="label-text font-medium">Content</span>
                                <span className="badge badge-xs badge-error">Required</span>
                            </Label>

                            {showPreview ? (
                                <div className="min-h-[400px] p-4 bg-base-200/30 rounded-md border border-base-300 overflow-auto">
                                    <div className="prose prose-sm max-w-none">
                                        {formData.contentType === 'markdown' ? (
                                            <div className="markdown-content">
                                                <div
                                                    className="markdown-preview"
                                                    dangerouslySetInnerHTML={{
                                                        __html: formData.content
                                                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                                            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                                            .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                                            .replace(/`([^`]+)`/gim, '<code class="bg-base-300 px-1 rounded">$1</code>')
                                                            .replace(/```([\s\S]*?)```/gim, '<pre class="bg-base-300 p-3 rounded overflow-x-auto"><code>$1</code></pre>')
                                                            .replace(/\n/gim, '<br>')
                                                    }}
                                                />
                                            </div>
                                        ) : formData.contentType === 'html' ? (
                                            <div
                                                className="html-content"
                                                dangerouslySetInnerHTML={{ __html: formData.content }}
                                            />
                                        ) : (
                                            <div className="text-content">
                                                <pre className="whitespace-pre-wrap text-sm">{formData.content}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                        <Code size={60} className="text-warning/10" />
                                    </div>
                                    <Textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        className="min-h-[400px] pl-20 font-mono text-sm"
                                        placeholder={
                                            formData.contentType === 'markdown'
                                                ? `# Resource Title

## Introduction
Write your introduction here...

## Main Content
- Point 1
- Point 2
- Point 3

## Code Examples
\`\`\`javascript
// Your code here
console.log('Hello World');
\`\`\`

## Conclusion
Wrap up your resource...`
                                                : formData.contentType === 'html'
                                                    ? `<!DOCTYPE html>
<html>
<head>
    <title>Resource Title</title>
</head>
<body>
    <h1>Resource Title</h1>
    <p>Your content here...</p>
</body>
</html>`
                                                    : `Write your plain text content here...

You can include:
- Bullet points
- Numbered lists
- Code snippets
- Explanations

Make it easy to read and understand.`
                                        }
                                        required
                                    />
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-base-content/70">
                                    {formData.contentType === 'markdown'
                                        ? 'Use Markdown syntax for formatting'
                                        : formData.contentType === 'html'
                                            ? 'Write valid HTML code'
                                            : 'Plain text content'
                                    }
                                </p>
                                <div className="text-xs text-base-content/70">
                                    {formData.content.length} characters
                                </div>
                            </div>
                        </div>

                        {/* Content Templates */}
                        {!showPreview && (
                            <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-warning/30">
                                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                                        <FileText size={18} />
                                    </div>
                                    Quick Templates
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            name: 'Basic Tutorial',
                                            content: `# Tutorial Title

## Overview
Brief description of what this tutorial covers.

## Prerequisites
- Requirement 1
- Requirement 2

## Steps
1. Step one
2. Step two
3. Step three

## Code Example
\`\`\`javascript
// Your code here
\`\`\`

## Summary
What you learned and next steps.`,
                                            type: 'markdown'
                                        },
                                        {
                                            name: 'Code Template',
                                            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Title</title>
    <style>
        /* Your CSS here */
    </style>
</head>
<body>
    <header>
        <h1>Template Title</h1>
    </header>
    
    <main>
        <!-- Your content here -->
    </main>
    
    <script>
        // Your JavaScript here
    </script>
</body>
</html>`,
                                            type: 'html'
                                        },
                                        {
                                            name: 'Cheat Sheet',
                                            content: `CHEAT SHEET: [Topic Name]

BASIC COMMANDS
- Command 1: Description
- Command 2: Description
- Command 3: Description

COMMON PATTERNS
- Pattern 1: Use case
- Pattern 2: Use case
- Pattern 3: Use case

TIPS & TRICKS
- Tip 1
- Tip 2
- Tip 3

RESOURCES
- Link 1: Description
- Link 2: Description`,
                                            type: 'text'
                                        }
                                    ].map((template, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            variant="outline"
                                            className="h-auto p-4 text-left"
                                            onClick={() => {
                                                if (template.type === formData.contentType) {
                                                    setFormData(prev => ({ ...prev, content: template.content }));
                                                } else {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        contentType: template.type as any,
                                                        content: template.content
                                                    }));
                                                }
                                            }}
                                        >
                                            <div className="space-y-2">
                                                <div className="font-medium">{template.name}</div>
                                                <div className="text-xs text-base-content/70">
                                                    {template.type.toUpperCase()} template
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Form Actions now in Navbar */}
                </form>
            </div>
        </div>
    );
};

export default ForgeCreatePage; 