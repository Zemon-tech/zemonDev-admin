import React from 'react';

export interface IForgeResourceData {
    title: string;
    type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation';
    url?: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isExternal: boolean;
    content?: string;
}

interface ForgeResourceFormProps {
    formData: IForgeResourceData;
    setFormData: React.Dispatch<React.SetStateAction<IForgeResourceData>>;
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
    errorMsg?: string;
}

const ForgeResourceForm: React.FC<ForgeResourceFormProps> = ({ formData, setFormData, onSubmit, isEdit = false, errorMsg }) => {
    // Ensure content is always initialized for editing
    React.useEffect(() => {
        if (!formData.content && !formData.isExternal) {
            setFormData(prev => ({ ...prev, content: '' }));
        }
    }, [formData.isExternal, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : value }));
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

    return (
        <form onSubmit={onSubmit} className="w-full max-w-6xl mx-auto bg-base-100 rounded-xl p-8 space-y-0 border border-base-300 flex flex-row gap-8 items-start min-h-[70vh]">
            {/* Left: All fields except content */}
            <div className="flex flex-col gap-4 w-[340px] min-w-[300px]">
                {errorMsg && <div className="alert alert-error mb-2">{errorMsg}</div>}
                {/* Resource Type Tabs */}
                <div className="flex flex-row gap-2 items-center mb-2">
                    <label className="label font-semibold text-base">Resource Type:</label>
                    <div className="tabs tabs-boxed">
                        <a
                            className={`tab text-base ${formData.isExternal ? 'tab-active' : ''}`}
                            onClick={() => handleTab(true)}
                            role="button"
                        >
                            Link
                        </a>
                        <a
                            className={`tab text-base ${!formData.isExternal ? 'tab-active' : ''}`}
                            onClick={() => handleTab(false)}
                            role="button"
                        >
                            Document
                        </a>
                    </div>
                </div>
                {/* Title */}
                <div className="form-control">
                    <label className="label label-text font-semibold text-base">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered input-md w-full" required />
                </div>
                {/* Type */}
                <div className="form-control">
                    <label className="label label-text font-semibold text-base">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered select-md w-full" required>
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="book">Book</option>
                        <option value="course">Course</option>
                        <option value="tool">Tool</option>
                        <option value="repository">Repository</option>
                        <option value="documentation">Documentation</option>
                    </select>
                </div>
                {/* Difficulty */}
                <div className="form-control">
                    <label className="label label-text font-semibold text-base">Difficulty</label>
                    <div className="flex gap-3 mt-1">
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="difficulty" value="beginner" checked={formData.difficulty === 'beginner'} onChange={handleChange} className="radio radio-primary" />
                            <span>Beginner</span>
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="difficulty" value="intermediate" checked={formData.difficulty === 'intermediate'} onChange={handleChange} className="radio radio-primary" />
                            <span>Intermediate</span>
                        </label>
                        <label className="cursor-pointer flex items-center gap-2">
                            <input type="radio" name="difficulty" value="advanced" checked={formData.difficulty === 'advanced'} onChange={handleChange} className="radio radio-primary" />
                            <span>Advanced</span>
                        </label>
                    </div>
                </div>
                {/* Tags */}
                <div className="form-control">
                    <label className="label label-text font-semibold text-base">Tags <span className="text-xs">(comma-separated)</span></label>
                    <input type="text" name="tags" value={formData.tags.join(', ')} onChange={handleChange} className="input input-bordered input-md w-full" placeholder="e.g. react, frontend, api" />
                </div>
                {/* URL or Description */}
                {formData.isExternal ? (
                    <div className="form-control">
                        <label className="label label-text font-semibold text-base">URL</label>
                        <input type="url" name="url" value={formData.url || ''} onChange={handleChange} className="input input-bordered input-md w-full" required={formData.isExternal} placeholder="https://example.com" />
                    </div>
                ) : (
                    <div className="form-control">
                        <label className="label label-text font-semibold text-base">Short Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered min-h-[80px] text-base w-full resize-y" required />
                    </div>
                )}
                {/* Actions */}
                <div className="flex flex-row gap-2 mt-4">
                    <button type="submit" className="btn btn-primary btn-md w-full">{isEdit ? 'Save Changes' : 'Create Resource'}</button>
                    <a href="/admin/forge" className="btn btn-ghost btn-md w-full">Cancel</a>
                </div>
            </div>
            {/* Right: Content (Markdown) */}
            <div className="flex-1 flex flex-col h-full">
                {!formData.isExternal && (
                    <div className="form-control h-full flex-1">
                        <label className="label flex justify-between items-center">
                            <span className="label-text font-semibold text-base">Content</span>
                            <span className="badge badge-info badge-outline">Markdown Supported</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content ?? ''}
                            onChange={handleChange}
                            className="textarea textarea-bordered min-h-[60vh] text-base w-full resize-y"
                            placeholder="Enter markdown content..."
                            required={!formData.isExternal}
                            style={{ minHeight: '60vh', maxHeight: '70vh' }}
                        />
                    </div>
                )}
            </div>
        </form>
    );
};

export default ForgeResourceForm; 