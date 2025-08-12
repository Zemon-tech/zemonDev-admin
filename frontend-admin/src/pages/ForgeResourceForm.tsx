import React, { useState, useEffect } from 'react';
import { detectContentType, getContentTypeBadgeClasses, getContentTypeLabel } from '../utils/contentTypeDetection';
import ContentPreview from '../components/common/ContentPreview';
import { htmlTemplates, getTemplatesByCategory, getTemplateCategories } from '../utils/htmlTemplates';

export interface IForgeResourceData {
    title: string;
    type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation';
    url?: string;
    thumbnail?: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isExternal: boolean;
    content?: string;
    contentType: 'markdown' | 'html';
}

interface ForgeResourceFormProps {
    formData: IForgeResourceData;
    setFormData: React.Dispatch<React.SetStateAction<IForgeResourceData>>;
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
    errorMsg?: string;
}

interface UrlPreviewData {
    youtube: { id: string };
    image: { url: string };
    website: { url: string };
    unknown: { url: string };
}

type UrlPreviewType = {
    type: keyof UrlPreviewData;
    data: UrlPreviewData[keyof UrlPreviewData];
}

// URL utility functions
const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ForgeResourceForm: React.FC<ForgeResourceFormProps> = ({ formData, setFormData, onSubmit, isEdit = false, errorMsg }) => {
    const [urlPreview, setUrlPreview] = useState<UrlPreviewType | null>(null);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

    // Ensure content is always initialized for editing
    React.useEffect(() => {
        if (!formData.content && !formData.isExternal) {
            setFormData(prev => ({ ...prev, content: '' }));
        }
    }, [formData.isExternal, setFormData]);

    // Handle URL preview
    useEffect(() => {
        if (formData.isExternal && formData.url) {
            const url = formData.url.trim();
            
            // Check for YouTube
            const youtubeId = getYoutubeVideoId(url);
            if (youtubeId) {
                setUrlPreview({
                    type: 'youtube',
                    data: { id: youtubeId }
                });
                return;
            }
            
            // Check if URL is an image
            if (/\.(jpeg|jpg|gif|png)$/i.test(url)) {
                setUrlPreview({
                    type: 'image',
                    data: { url }
                });
                return;
            }
            
            // Default website preview
            setUrlPreview({
                type: 'website',
                data: { url }
            });
        } else {
            setUrlPreview(null);
        }
    }, [formData.url, formData.isExternal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = { ...prev, [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : value };
            
            // Auto-detect content type when content changes
            if (name === 'content' && value.trim().length > 0) {
                const detectedType = detectContentType(value);
                if (detectedType !== prev.contentType) {
                    updatedData.contentType = detectedType;
                }
            }
            
            return updatedData;
        });
    };

    // Toggle between Link and Document
    const handleTab = (isExternal: boolean) => {
        setFormData(prev => ({
            ...prev,
            isExternal,
            url: isExternal ? prev.url || '' : '',
            content: !isExternal ? prev.content || '' : '',
        }));
    };

    const renderUrlPreview = () => {
        if (!urlPreview) return null;
        
        switch (urlPreview.type) {
            case 'youtube':
                return (
                    <div className="flex flex-col items-center">
                        <div className="relative w-full pb-[56.25%] mb-2">
                            <iframe 
                                className="absolute inset-0 w-full h-full rounded-md" 
                                src={`https://www.youtube.com/embed/${(urlPreview.data as UrlPreviewData['youtube']).id}`}
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <svg className="text-red-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                            <span className="text-sm">YouTube Video Preview</span>
                        </div>
                    </div>
                );
                
            case 'image': {
                return (
                    <div className="flex flex-col items-center">
                        <img 
                            src={(urlPreview.data as UrlPreviewData['image']).url} 
                            alt="Preview" 
                            className="max-h-64 max-w-full rounded-md object-contain border border-base-300"
                            onError={() => {
                                // If image fails to load, show fallback
                                setUrlPreview({type: 'unknown', data: {url: formData.url || ''}});
                            }}
                        />
                        <span className="text-xs mt-2 text-base-content/70">Image Preview</span>
                    </div>
                );
            }
                
            case 'website':
            case 'unknown':
            default: {
                // Extract domain for favicon
                let domain = '';
                try {
                    const urlObj = new URL(formData.url || '');
                    domain = urlObj.hostname;
                } catch {
                    domain = '';
                }
                
                return (
                    <div className="flex flex-col items-center p-4">
                        <div className="bg-base-200 rounded-lg p-4 w-full flex flex-col items-center">
                            {domain && (
                                <div className="mb-3 flex items-center gap-2">
                                    {/* Favicon */}
                                    <img 
                                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                                        alt=""
                                        className="w-6 h-6"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <span className="text-sm font-medium">{domain}</span>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-center gap-2 mt-2 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </div>
                            
                            <div className="truncate max-w-full text-sm">
                                <a href={formData.url} target="_blank" rel="noopener noreferrer" className="link link-primary">
                                    {formData.url}
                                </a>
                            </div>
                            
                            <button 
                                className="btn btn-xs btn-outline mt-3"
                                type="button"
                                onClick={() => window.open(formData.url, '_blank')}
                            >
                                Visit Link
                            </button>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <>
            <form onSubmit={onSubmit} className="w-full max-w-7xl bg-base-100 rounded-lg border border-base-300 shadow overflow-hidden">
            {/* Form Header - Simplified */}
            <div className="bg-base-200 py-4 px-6 border-b border-base-300 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20"></path><path d="m17 5-5-3-5 3"></path>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-lg">{isEdit ? 'Update Resource' : 'New Resource'}</span>
                        {!formData.isExternal && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-base-content/70">Content Type:</span>
                                <span className={`${getContentTypeBadgeClasses(formData.contentType)}`}>
                                    {getContentTypeLabel(formData.contentType)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex p-1.5 bg-base-300/50 rounded-xl shadow-inner overflow-hidden">
                    <button
                        type="button"
                        onClick={() => handleTab(true)}
                        className={`relative px-5 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                            formData.isExternal 
                            ? 'text-primary-content bg-primary shadow-md' 
                            : 'text-base-content hover:bg-base-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            External Link
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTab(false)}
                        className={`relative px-5 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                            !formData.isExternal 
                            ? 'text-primary-content bg-primary shadow-md' 
                            : 'text-base-content hover:bg-base-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            Document
                        </div>
                    </button>
                </div>
            </div>
            
            <div className="flex flex-row gap-8 p-6">
                {/* Left: Form fields */}
                <div className="flex flex-col gap-4 w-[360px] min-w-[340px]">
                    {errorMsg && <div className="alert alert-error py-3 text-sm shadow-sm">{errorMsg}</div>}
                
                    {/* Top row: Title and Type */}
                    <div className="flex gap-3">
                        {/* Title */}
                        <div className="form-control flex-1">
                            <label className="label py-1">
                                <span className="label-text text-xs font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M7 21h10"></path><rect x="2" y="3" width="20" height="14" rx="2"></rect>
                                    </svg>
                                    Title
                                </span>
                            </label>
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" 
                                required 
                            />
                        </div>
                        
                        {/* Type */}
                        <div className="form-control w-28">
                            <label className="label py-1">
                                <span className="label-text text-xs font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12h10"></path><path d="M14 12h8"></path>
                                    </svg>
                                    Type
                                </span>
                            </label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange} 
                                className="select select-sm select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" 
                                required
                            >
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                                <option value="book">Book</option>
                                <option value="course">Course</option>
                                <option value="tool">Tool</option>
                                <option value="repository">Repository</option>
                                <option value="documentation">Documentation</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Difficulty */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                                </svg>
                                Difficulty Level
                            </span>
                        </label>
                        <div className="flex gap-1 mt-0">
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="beginner" 
                                    checked={formData.difficulty === 'beginner'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'beginner' ? 'bg-primary text-primary-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'beginner' ? 'text-primary-content font-medium' : ''}`}>Beginner</span>
                            </label>
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="intermediate" 
                                    checked={formData.difficulty === 'intermediate'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'intermediate' ? 'bg-primary text-primary-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'intermediate' ? 'text-primary-content font-medium' : ''}`}>Intermediate</span>
                            </label>
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="advanced" 
                                    checked={formData.difficulty === 'advanced'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'advanced' ? 'bg-primary text-primary-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'advanced' ? 'text-primary-content font-medium' : ''}`}>Advanced</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 7h1"></path><path d="M12 7h1"></path><path d="M15 7h1"></path>
                                </svg>
                                Tags <span className="text-xs opacity-60">(comma-separated)</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            name="tags" 
                            value={formData.tags.join(', ')} 
                            onChange={handleChange} 
                            className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" 
                            placeholder="e.g. react, frontend, api" 
                        />
                    </div>
                    
                    {/* URL for external resources */}
                    {formData.isExternal && (
                        <div className="form-control">
                            <label className="label py-1">
                                <span className="label-text text-xs font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                    </svg>
                                    External URL
                                </span>
                            </label>
                            <input 
                                type="url" 
                                name="url" 
                                value={formData.url || ''} 
                                onChange={handleChange} 
                                className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" 
                                required={formData.isExternal} 
                                placeholder="https://example.com" 
                            />
                        </div>
                    )}
                    
                    {/* Thumbnail URL */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21,15 16,10 5,21"></polyline>
                                </svg>
                                    Thumbnail URL
                                </span>
                            </label>
                            <input 
                                type="url" 
                                name="thumbnail" 
                                value={formData.thumbnail || ''} 
                                onChange={handleChange} 
                                className="input input-sm input-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary" 
                                placeholder="https://example.com/thumbnail.jpg" 
                            />
                            {formData.thumbnail && (
                                <div className="mt-2">
                                    <img 
                                        src={formData.thumbnail} 
                                        alt="Thumbnail preview" 
                                        className="w-20 h-20 object-cover rounded border border-base-300"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    
                    {/* Description */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                </svg>
                                Description
                            </span>
                        </label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className={`textarea textarea-bordered textarea-sm min-h-[${formData.isExternal ? '80px' : '50px'}] w-full resize-y focus:border-primary focus:ring-1 focus:ring-primary`} 
                            required 
                            placeholder="Brief description of this resource..."
                        />
                    </div>
                    
                    {/* Content Type */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                </svg>
                                Content Type
                                <div className="tooltip tooltip-right" data-tip="Choose between Markdown (simple text formatting) and HTML (rich content with images, videos, forms, etc.)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="m9 12 2 2 4-4"/>
                                    </svg>
                                </div>
                            </span>
                        </label>
                        <div className="flex gap-2">
                            <select 
                                name="contentType" 
                                value={formData.contentType} 
                                onChange={handleChange} 
                                className="select select-sm select-bordered flex-1 focus:border-primary focus:ring-primary focus:ring-1"
                            >
                                <option value="markdown">Markdown - Simple text formatting</option>
                                <option value="html">HTML - Rich content & media</option>
                            </select>
                            {formData.contentType === 'html' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const modal = document.getElementById('template-modal') as HTMLDialogElement;
                                        if (modal) modal.showModal();
                                    }}
                                    className="btn btn-outline btn-sm btn-square"
                                    title="Choose HTML template"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2v20"></path>
                                        <path d="m17 5-5-3-5 3"></path>
                                        <path d="M7 5v14"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="btn btn-primary btn-sm flex-1">
                            {isEdit ? 'Save Changes' : 'Create Resource'}
                        </button>
                        <a href="/admin/forge" className="btn btn-outline btn-neutral btn-sm">Cancel</a>
                    </div>
                </div>
                
                {/* Right: Content Editor */}
                <div className="flex-1 flex flex-col gap-4">
                    {!formData.isExternal ? (
                        <div className="bg-base-200/50 rounded-lg p-6 flex flex-col gap-4">
                            <label className="label py-1 flex justify-between items-center">
                                <span className="label-text text-xs font-medium flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                    </svg>
                                    Content
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`${getContentTypeBadgeClasses(formData.contentType)}`}>
                                        {getContentTypeLabel(formData.contentType)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const detectedType = detectContentType(formData.content || '');
                                            if (detectedType !== formData.contentType) {
                                                setFormData(prev => ({ ...prev, contentType: detectedType }));
                                            }
                                        }}
                                        className="btn btn-ghost btn-xs"
                                        title="Auto-detect content type"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
                                        </svg>
                                    </button>
                                </div>
                            </label>
                            <div className="flex flex-col border rounded-md overflow-hidden">
                                <div className="bg-base-200 py-1 px-3 border-b border-base-300 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="badge badge-xs badge-neutral">
                                            {formData.contentType === 'html' ? 'HTML Editor' : 'Markdown Editor'}
                                        </span>
                                        {formData.contentType === 'html' && (
                                            <span className="badge badge-warning badge-xs">HTML Content</span>
                                        )}
                                    </div>
                                    <div className="tabs tabs-xs">
                                        <button
                                            type="button"
                                            className={`tab ${activeTab === 'editor' ? 'tab-active' : ''}`}
                                            onClick={() => setActiveTab('editor')}
                                        >
                                            Editor
                                        </button>
                                        <button
                                            type="button"
                                            className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
                                            onClick={() => setActiveTab('preview')}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                                {activeTab === 'editor' ? (
                                    <textarea
                                        name="content"
                                        value={formData.content ?? ''}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered rounded-none border-none h-full min-h-[40vh] max-h-[45vh] p-3 text-sm font-mono focus:outline-none"
                                        placeholder={formData.contentType === 'html' 
                                            ? `<!DOCTYPE html>
<html>
<head>
    <title>Your Title</title>
</head>
<body>
    <h1>Your Content</h1>
    <p>HTML content goes here...</p>
</body>
</html>`
                                            : `# Title
## Subtitle

Content goes here...`
                                        }
                                        required={!formData.isExternal}
                                        style={{ resize: 'none' }}
                                    />
                                ) : (
                                    <div className="flex-1 min-h-[40vh] max-h-[45vh] overflow-hidden">
                                        <ContentPreview 
                                            content={formData.content || ''} 
                                            contentType={formData.contentType}
                                            className="h-full"
                                        />
                                    </div>
                                )}
                            </div>
                            {formData.contentType === 'html' && (
                                <div className="alert alert-warning py-2 text-xs">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                        <line x1="12" y1="9" x2="12" y2="13"/>
                                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                    <span>HTML content will be sanitized for security. Only safe HTML elements and attributes are allowed.</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-base-200/50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px]">
                            {formData.url ? (
                                <div className="w-full">
                                    {renderUrlPreview()}
                                    {formData.thumbnail && (
                                        <div className="mt-6 text-center">
                                            <h4 className="text-sm font-medium mb-3">Thumbnail Preview</h4>
                                            <img 
                                                src={formData.thumbnail} 
                                                alt="Thumbnail" 
                                                className="mx-auto max-w-full max-h-48 object-contain rounded border border-base-300"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-base-content/70 p-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                    </svg>
                                    <p className="mt-2 text-sm">Enter a URL above to see a preview</p>
                                    {formData.thumbnail && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Thumbnail Preview</h4>
                                            <img 
                                                src={formData.thumbnail} 
                                                alt="Thumbnail" 
                                                className="mx-auto max-w-full max-h-32 object-contain rounded border border-base-300"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>

        {/* HTML Template Modal */}
        <dialog id="template-modal" className="modal">
            <div className="modal-box w-11/12 max-w-4xl">
                <h3 className="font-bold text-lg mb-4">Choose HTML Template</h3>
                <div className="mb-4">
                    <select 
                        className="select select-bordered w-full"
                        onChange={(e) => {
                            const category = e.target.value;
                            if (category === 'all') {
                                // Show all templates
                                const templateList = document.getElementById('template-list');
                                if (templateList) {
                                    templateList.innerHTML = htmlTemplates.map(template => `
                                        <div class="border rounded-lg p-4 hover:bg-base-200 cursor-pointer" onclick="window.selectTemplate('${template.name}')">
                                            <h4 class="font-semibold text-sm">${template.name}</h4>
                                            <p class="text-xs text-base-content/70 mt-1">${template.description}</p>
                                            <div class="mt-2 text-xs text-primary">${template.category}</div>
                                        </div>
                                    `).join('');
                                }
                            } else {
                                // Filter by category
                                const templates = getTemplatesByCategory(category as 'basic' | 'media' | 'interactive' | 'layout');
                                const templateList = document.getElementById('template-list');
                                if (templateList) {
                                    templateList.innerHTML = templates.map(template => `
                                        <div class="border rounded-lg p-4 hover:bg-base-200 cursor-pointer" onclick="window.selectTemplate('${template.name}')">
                                            <h4 class="font-semibold text-sm">${template.name}</h4>
                                            <p class="text-xs text-base-content/70 mt-1">${template.description}</p>
                                            <div class="mt-2 text-xs text-primary">${template.category}</div>
                                        </div>
                                    `).join('');
                                }
                            }
                        }}
                    >
                        <option value="all">All Categories</option>
                        {getTemplateCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                
                <div id="template-list" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {htmlTemplates.map(template => (
                        <div 
                            key={template.name}
                            className="border rounded-lg p-4 hover:bg-base-200 cursor-pointer"
                            onClick={() => {
                                setFormData(prev => ({ 
                                    ...prev, 
                                    content: template.content,
                                    contentType: 'html'
                                }));
                                const modal = document.getElementById('template-modal') as HTMLDialogElement;
                                if (modal) modal.close();
                            }}
                        >
                            <h4 className="font-semibold text-sm">{template.name}</h4>
                            <p className="text-xs text-base-content/70 mt-1">{template.description}</p>
                            <div className="mt-2 text-xs text-primary">{template.category}</div>
                        </div>
                    ))}
                </div>
                
                <div className="modal-action">
                    <button 
                        className="btn btn-ghost"
                        onClick={() => {
                            const modal = document.getElementById('template-modal') as HTMLDialogElement;
                            if (modal) modal.close();
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </dialog>
      </>
    );
};

export default ForgeResourceForm; 