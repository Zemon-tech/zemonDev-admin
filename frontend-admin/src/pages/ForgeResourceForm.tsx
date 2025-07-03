import React from 'react';

export interface IForgeResourceData {
    title: string;
    type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'repository' | 'documentation';
    url: string;
    description: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ForgeResourceFormProps {
    formData: IForgeResourceData;
    setFormData: React.Dispatch<React.SetStateAction<IForgeResourceData>>;
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
}

const ForgeResourceForm: React.FC<ForgeResourceFormProps> = ({ formData, setFormData, onSubmit, isEdit = false }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : value }));
    };

    return (
        <form onSubmit={onSubmit} className="card bg-base-100 shadow-xl p-8 space-y-4">
            <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">URL</span></label>
                <input type="url" name="url" value={formData.url} onChange={handleChange} className="input input-bordered" required />
            </div>
            
            <div className="form-control">
                <label className="label"><span className="label-text">Description</span></label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered" required />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Type</span></label>
                <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered" required>
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="book">Book</option>
                    <option value="course">Course</option>
                    <option value="tool">Tool</option>
                    <option value="repository">Repository</option>
                    <option value="documentation">Documentation</option>
                </select>
            </div>
            
            <div className="form-control">
                <label className="label"><span className="label-text">Difficulty</span></label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="select select-bordered" required>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Tags (comma-separated)</span></label>
                <input type="text" name="tags" value={formData.tags.join(', ')} onChange={handleChange} className="input input-bordered" />
            </div>

            <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Resource'}</button>
            </div>
        </form>
    );
};

export default ForgeResourceForm; 