import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ForgeResourceForm from './ForgeResourceForm';
import type { IForgeResourceData } from './ForgeResourceForm';

const ForgeEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: resource, isLoading, error } = useFetch<IForgeResourceData>(`/forge/${id}`);
    
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

    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title,
                type: resource.type,
                url: resource.url,
                description: resource.description,
                tags: resource.tags,
                difficulty: resource.difficulty,
                isExternal: typeof resource.isExternal === 'boolean' ? resource.isExternal : !!resource.url,
                content: resource.content || '',
            });
        }
    }, [resource]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/forge/${id}`, formData);
            navigate('/admin/forge');
        } catch (err) {
            console.error('Failed to update resource', err);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Resource</h1>
            <ForgeResourceForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEdit={true} />
        </div>
    );
};

export default ForgeEditPage; 