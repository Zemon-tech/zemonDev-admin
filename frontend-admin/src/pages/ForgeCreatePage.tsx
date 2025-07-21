import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApi } from '../lib/api';
import ForgeResourceForm from './ForgeResourceForm';
import type { IForgeResourceData } from './ForgeResourceForm';

const ForgeCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const apiFetch = useApi();
    const [formData, setFormData] = useState<IForgeResourceData>({
        title: '',
        type: 'article',
        url: '',
        description: '',
        tags: [],
        difficulty: 'intermediate',
        isExternal: true,
        content: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch('/forge', {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            navigate('/admin/forge');
        } catch (err) {
            console.error('Failed to create resource', err);
        }
    };

    return (
        <div className="w-full h-full overflow-auto pb-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Create New Resource</h1>
                    <p className="text-base-content/70 mt-0.5">Add a new resource to the Forge library</p>
                </div>
                <Link 
                    to="/admin/forge" 
                    className="btn btn-ghost btn-sm gap-1"
                >
                    <ArrowLeft size={16} />
                    Back to List
                </Link>
            </div>
            
            <ForgeResourceForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit} 
            />
        </div>
    );
};

export default ForgeCreatePage; 