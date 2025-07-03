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
    });

    useEffect(() => {
        if (problem) {
            setFormData(problem);
        }
    }, [problem]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleListChange = (name: 'tags' | 'constraints' | 'hints', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    };

    const handleRequirementChange = (type: 'functional' | 'nonFunctional', value: string) => {
        setFormData(prev => ({
            ...prev,
            requirements: { ...prev.requirements, [type]: value.split('\\n') }
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
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Crucible Problem</h1>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8 space-y-4">
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
                    <textarea value={formData.requirements.functional.join('\\n')} onChange={e => handleRequirementChange('functional', e.target.value)} className="textarea textarea-bordered" />
                </div>

                <div className="form-control">
                    <label className="label"><span className="label-text">Non-Functional Requirements (one per line)</span></label>
                    <textarea value={formData.requirements.nonFunctional.join('\\n')} onChange={e => handleRequirementChange('nonFunctional', e.target.value)} className="textarea textarea-bordered" />
                </div>

                <div className="form-control">
                    <label className="label"><span className="label-text">Constraints (comma-separated)</span></label>
                    <input type="text" value={formData.constraints.join(', ')} onChange={e => handleListChange('constraints', e.target.value)} className="input input-bordered" />
                </div>

                <div className="form-control">
                    <label className="label"><span className="label-text">Expected Outcome</span></label>
                    <input type="text" name="expectedOutcome" value={formData.expectedOutcome} onChange={handleChange} className="input input-bordered" required />
                </div>

                <div className="form-control">
                    <label className="label"><span className="label-text">Hints (comma-separated)</span></label>
                    <input type="text" value={formData.hints.join(', ')} onChange={e => handleListChange('hints', e.target.value)} className="input input-bordered" />
                </div>

                <div className="form-control mt-6">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default CrucibleEditPage; 