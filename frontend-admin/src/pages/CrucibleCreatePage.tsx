import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import CrucibleProblemForm from './CrucibleProblemForm';
import type { ICrucibleProblemData } from './CrucibleProblemForm';

const CrucibleCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ICrucibleProblemData>({
        title: '',
        description: '',
        difficulty: 'medium',
        tags: [],
        requirements: {
            functional: [],
            nonFunctional: []
        },
        constraints: [],
        expectedOutcome: '',
        hints: []
    });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/crucible', formData);
            navigate('/admin/crucible');
        } catch (err) {
            console.error('Failed to create problem', err);
        }
    };

    return (
        <div className="w-full h-full overflow-auto pb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Create New Challenge</h1>
                    <p className="text-base-content/70 mt-0.5">Design a problem for users to solve</p>
                </div>
                <Link 
                    to="/admin/crucible" 
                    className="btn btn-ghost btn-sm gap-1"
                >
                    <ArrowLeft size={16} />
                    Back to Challenges
                </Link>
            </div>
            
            <CrucibleProblemForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit} 
            />
        </div>
    );
};

export default CrucibleCreatePage; 