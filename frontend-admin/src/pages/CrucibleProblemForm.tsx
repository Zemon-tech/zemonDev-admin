import React from 'react';
import { Save, Sparkles, Target, FileText, Layers, CheckCircle2, MessageSquare } from 'lucide-react';

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
        <form onSubmit={onSubmit} className="w-full max-w-6xl mx-auto bg-base-100 rounded-xl border border-base-200 shadow-lg overflow-hidden">
            <div className="bg-base-200/60 py-4 px-6 border-b border-base-300 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                        <Target size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{isEdit ? 'Edit Challenge' : 'New Challenge'}</h2>
                        <p className="text-xs text-base-content/70">Craft a coding problem for developers to solve</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {formData.difficulty && (
                        <div className={`badge ${
                            formData.difficulty === 'easy' ? 'badge-success' :
                            formData.difficulty === 'medium' ? 'badge-warning' :
                            formData.difficulty === 'hard' ? 'badge-error' : 
                            'badge-neutral'
                        } badge-lg`}>
                            {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-max">
                <div className="space-y-5">
                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
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
                            required 
                            placeholder="Enter a descriptive title"
                        />
                    </div>

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
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="textarea textarea-bordered min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full" 
                                required 
                                placeholder="Describe the problem in detail..."
                            />
                        </div>
                        <p className="text-xs text-base-content/70 mt-2 ml-1">
                            Describe the problem, context, and any important details
                        </p>
                    </div>

                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2">
                            <Target size={14} className="text-primary" />
                            <span className="label-text font-medium">Difficulty Level</span>
                        </label>
                        <div className="flex gap-2">
                            <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                ${formData.difficulty === 'easy' ? 'border-success bg-success/10' : 'border-base-300'}`}>
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="easy" 
                                    checked={formData.difficulty === 'easy'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <span className={`relative z-10 text-sm ${formData.difficulty === 'easy' ? 'text-success font-medium' : ''}`}>Easy</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                ${formData.difficulty === 'medium' ? 'border-warning bg-warning/10' : 'border-base-300'}`}>
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="medium" 
                                    checked={formData.difficulty === 'medium'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <span className={`relative z-10 text-sm ${formData.difficulty === 'medium' ? 'text-warning font-medium' : ''}`}>Medium</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                ${formData.difficulty === 'hard' ? 'border-error bg-error/10' : 'border-base-300'}`}>
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="hard" 
                                    checked={formData.difficulty === 'hard'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <span className={`relative z-10 text-sm ${formData.difficulty === 'hard' ? 'text-error font-medium' : ''}`}>Hard</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border rounded-md p-2.5 text-center relative overflow-hidden transition-all hover:bg-base-200 
                                ${formData.difficulty === 'expert' ? 'border-neutral bg-neutral/10' : 'border-base-300'}`}>
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value="expert" 
                                    checked={formData.difficulty === 'expert'} 
                                    onChange={handleChange} 
                                    className="absolute opacity-0" 
                                />
                                <span className={`relative z-10 text-sm ${formData.difficulty === 'expert' ? 'text-neutral font-medium' : ''}`}>Expert</span>
                            </label>
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
                                className="textarea textarea-bordered min-h-[100px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y w-full" 
                                required 
                                placeholder="Describe what a successful solution should accomplish"
                            />
                        </div>
                        <p className="text-xs text-base-content/70 mt-2 ml-1">
                            Clearly define what a successful solution looks like
                        </p>
                    </div>
                </div>
                
                <div className="space-y-5">
                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2">
                            <Sparkles size={14} className="text-primary" />
                            <span className="label-text font-medium">Tags</span>
                            <span className="text-xs opacity-60">(comma-separated)</span>
                        </label>
                        <input 
                            type="text" 
                            name="tags" 
                            value={formData.tags.join(', ')} 
                            onChange={e => handleListChange('tags', e.target.value)} 
                            className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                            placeholder="e.g. react, frontend, algorithms"
                        />
                    </div>

                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Layers size={14} className="text-primary" />
                                <span className="label-text font-medium">Functional Requirements</span>
                            </div>
                            <span className="badge badge-xs badge-primary">One per line</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                <Layers size={60} className="text-primary/10" />
                            </div>
                            <textarea 
                                name="functional" 
                                value={formData.requirements.functional.join('\n')} 
                                onChange={e => handleRequirementChange('functional', e.target.value)} 
                                className="textarea textarea-bordered rounded-md border h-full min-h-[120px] p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full resize-y" 
                                placeholder="Each line will become a separate requirement..."
                            />
                        </div>
                    </div>

                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                <span className="label-text font-medium">Non-Functional Requirements</span>
                            </div>
                            <span className="badge badge-xs badge-secondary">One per line</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                                <Sparkles size={60} className="text-primary/10" />
                            </div>
                            <textarea 
                                name="nonFunctional" 
                                value={formData.requirements.nonFunctional.join('\n')} 
                                onChange={e => handleRequirementChange('nonFunctional', e.target.value)} 
                                className="textarea textarea-bordered rounded-md border h-full min-h-[120px] p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full resize-y" 
                                placeholder="Quality attributes like performance, security, etc..."
                            />
                        </div>
                    </div>

                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2">
                            <Target size={14} className="text-primary" />
                            <span className="label-text font-medium">Constraints</span>
                            <span className="text-xs opacity-60">(comma-separated)</span>
                        </label>
                        <input 
                            type="text" 
                            name="constraints" 
                            value={formData.constraints.join(', ')} 
                            onChange={e => handleListChange('constraints', e.target.value)} 
                            className="input input-bordered focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                            placeholder="e.g. time limit, memory usage, tools"
                        />
                    </div>

                    <div className="form-control bg-base-100 rounded-lg border border-base-200 p-4 transition-all hover:border-primary/30">
                        <label className="label pb-1 flex items-center gap-2">
                            <MessageSquare size={14} className="text-primary" />
                            <span className="label-text font-medium">Hints</span>
                            <span className="text-xs opacity-60">(comma-separated)</span>
                        </label>
                        <textarea 
                            name="hints" 
                            value={formData.hints.join(', ')} 
                            onChange={e => handleListChange('hints', e.target.value)} 
                            className="textarea textarea-bordered min-h-[80px] focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y" 
                            placeholder="Provide optional clues to help users solve the challenge"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-base-200 flex justify-end bg-base-100">
                <button type="submit" className="btn btn-primary gap-2">
                    <Save size={16} />
                    {isEdit ? 'Save Changes' : 'Create Challenge'}
                </button>
            </div>
        </form>
    );
};

export default CrucibleProblemForm; 