import React from 'react';

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
}

interface CrucibleProblemFormProps {
    formData: ICrucibleProblemData;
    setFormData: React.Dispatch<React.SetStateAction<ICrucibleProblemData>>;
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
}

const CrucibleProblemForm: React.FC<CrucibleProblemFormProps> = ({ formData, setFormData, onSubmit, isEdit = false }) => {
    
    const handleRequirementChange = (type: 'functional' | 'nonFunctional', value: string) => {
        setFormData(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [type]: value.split('\\n') }
        }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'tags' | 'constraints' | 'hints', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    };

    return (
        <form onSubmit={onSubmit} className="card bg-base-100 shadow-xl p-8 space-y-4">
            <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Description</span></label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered" required />
            </div>
            
            <div className="form-control">
                <label className="label"><span className="label-text">Difficulty</span></label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="select select-bordered" required>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                </select>
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Tags (comma-separated)</span></label>
                <input type="text" name="tags" value={formData.tags.join(', ')} onChange={e => handleListChange('tags', e.target.value)} className="input input-bordered" />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Functional Requirements (one per line)</span></label>
                <textarea name="functional" value={formData.requirements.functional.join('\\n')} onChange={e => handleRequirementChange('functional', e.target.value)} className="textarea textarea-bordered" />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Non-Functional Requirements (one per line)</span></label>
                <textarea name="nonFunctional" value={formData.requirements.nonFunctional.join('\\n')} onChange={e => handleRequirementChange('nonFunctional', e.target.value)} className="textarea textarea-bordered" />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Constraints (comma-separated)</span></label>
                <input type="text" name="constraints" value={formData.constraints.join(', ')} onChange={e => handleListChange('constraints', e.target.value)} className="input input-bordered" />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Expected Outcome</span></label>
                <input type="text" name="expectedOutcome" value={formData.expectedOutcome} onChange={handleChange} className="input input-bordered" required />
            </div>

            <div className="form-control">
                <label className="label"><span className="label-text">Hints (comma-separated)</span></label>
                <input type="text" name="hints" value={formData.hints.join(', ')} onChange={e => handleListChange('hints', e.target.value)} className="input input-bordered" />
            </div>

            <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Problem'}</button>
            </div>
        </form>
    );
};

export default CrucibleProblemForm; 