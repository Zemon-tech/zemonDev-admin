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
            requirements: { ...prev.requirements, [type]: value.split('\n') }
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
        <form onSubmit={onSubmit} className="w-full max-w-6xl bg-base-100 rounded-lg border border-base-300 shadow overflow-hidden">
            {/* Form Header */}
            <div className="bg-base-200 py-3 px-5 border-b border-base-300 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <span className="font-medium">{isEdit ? 'Edit Challenge' : 'New Challenge'}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="badge badge-neutral">
                        {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                    </div>
                </div>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    {/* Title */}
                    <div className="form-control">
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
                            className="input input-sm input-bordered focus:border-primary focus:ring-1 focus:ring-primary"
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                </svg>
                                Description
                            </span>
                        </label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="textarea textarea-sm textarea-bordered focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]" 
                            required 
                        />
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
                                    value="easy" 
                                    checked={formData.difficulty === 'easy'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'easy' ? 'bg-success text-success-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'easy' ? 'text-success-content font-medium' : ''}`}>Easy</span>
                            </label>
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="medium" 
                                    checked={formData.difficulty === 'medium'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'medium' ? 'bg-warning text-warning-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'medium' ? 'text-warning-content font-medium' : ''}`}>Medium</span>
                            </label>
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="hard" 
                                    checked={formData.difficulty === 'hard'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'hard' ? 'bg-error text-error-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'hard' ? 'text-error-content font-medium' : ''}`}>Hard</span>
                            </label>
                            <label className="flex-1 cursor-pointer border border-base-300 rounded p-1.5 hover:bg-base-200 text-center text-xs relative overflow-hidden">
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="expert" 
                                    checked={formData.difficulty === 'expert'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <div className={`${formData.difficulty === 'expert' ? 'bg-neutral text-neutral-content' : 'bg-transparent'} absolute inset-0 transition-all`}></div>
                                <span className={`relative z-10 transition-all ${formData.difficulty === 'expert' ? 'text-neutral-content font-medium' : ''}`}>Expert</span>
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
                            onChange={e => handleListChange('tags', e.target.value)} 
                            className="input input-sm input-bordered focus:border-primary focus:ring-1 focus:ring-primary" 
                            placeholder="e.g. react, frontend, algorithms"
                        />
                    </div>
                    
                    {/* Constraints */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path>
                                </svg>
                                Constraints <span className="text-xs opacity-60">(comma-separated)</span>
                            </span>
                        </label>
                        <input 
                            type="text" 
                            name="constraints" 
                            value={formData.constraints.join(', ')} 
                            onChange={e => handleListChange('constraints', e.target.value)} 
                            className="input input-sm input-bordered focus:border-primary focus:ring-1 focus:ring-primary" 
                            placeholder="e.g. time limit, memory usage, tools"
                        />
                    </div>

                    {/* Expected Outcome */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Expected Outcome
                            </span>
                        </label>
                        <textarea 
                            name="expectedOutcome" 
                            value={formData.expectedOutcome} 
                            onChange={handleChange} 
                            className="textarea textarea-sm textarea-bordered focus:border-primary focus:ring-1 focus:ring-primary" 
                            required 
                            placeholder="Describe what a successful solution should accomplish"
                        />
                    </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                    {/* Functional Requirements */}
                    <div className="form-control">
                        <label className="label py-1 flex justify-between items-center">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                    <path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5"></path>
                                    <circle cx="6" cy="14" r="3"></circle>
                                    <path d="M4.5 17 9 17.5"></path>
                                </svg>
                                Functional Requirements
                            </span>
                            <span className="badge badge-xs badge-info">One per line</span>
                        </label>
                        <div className="relative flex-1 flex flex-col border rounded-md overflow-hidden">
                            <div className="bg-base-200 py-1 px-3 border-b border-base-300 flex items-center gap-2">
                                <span className="badge badge-xs badge-primary">Required</span>
                            </div>
                            <textarea 
                                name="functional" 
                                value={formData.requirements.functional.join('\n')} 
                                onChange={e => handleRequirementChange('functional', e.target.value)} 
                                className="textarea textarea-bordered rounded-none border-none h-full min-h-[120px] p-3 text-sm focus:outline-none" 
                                placeholder="Each line will become a separate requirement..."
                            />
                        </div>
                    </div>

                    {/* Non-Functional Requirements */}
                    <div className="form-control">
                        <label className="label py-1 flex justify-between items-center">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                    <path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-5"></path>
                                    <circle cx="6" cy="14" r="3"></circle>
                                    <path d="M4.5 17 9 17.5"></path>
                                </svg>
                                Non-Functional Requirements
                            </span>
                            <span className="badge badge-xs badge-info">One per line</span>
                        </label>
                        <div className="relative flex-1 flex flex-col border rounded-md overflow-hidden">
                            <div className="bg-base-200 py-1 px-3 border-b border-base-300 flex items-center gap-2">
                                <span className="badge badge-xs badge-secondary">Optional</span>
                            </div>
                            <textarea 
                                name="nonFunctional" 
                                value={formData.requirements.nonFunctional.join('\n')} 
                                onChange={e => handleRequirementChange('nonFunctional', e.target.value)} 
                                className="textarea textarea-bordered rounded-none border-none h-full min-h-[120px] p-3 text-sm focus:outline-none" 
                                placeholder="Quality attributes like performance, security, etc..."
                            />
                        </div>
                    </div>

                    {/* Hints */}
                    <div className="form-control">
                        <label className="label py-1">
                            <span className="label-text text-xs font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <path d="M12 17h.01"></path>
                                </svg>
                                Hints <span className="text-xs opacity-60">(comma-separated)</span>
                            </span>
                        </label>
                        <textarea 
                            name="hints" 
                            value={formData.hints.join(', ')} 
                            onChange={e => handleListChange('hints', e.target.value)} 
                            className="textarea textarea-sm textarea-bordered focus:border-primary focus:ring-1 focus:ring-primary min-h-[60px]" 
                            placeholder="Provide optional clues to help users solve the challenge"
                        />
                    </div>
                    
                    {/* Submit Button */}
                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
                            </svg>
                            {isEdit ? 'Save Changes' : 'Create Challenge'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CrucibleProblemForm; 