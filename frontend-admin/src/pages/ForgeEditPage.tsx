import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../lib/api';
import ForgeResourceForm from './ForgeResourceForm';
import type { IForgeResourceData } from './ForgeResourceForm';

const ForgeEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        const fetchResource = async () => {
            try {
                const data = await apiFetch(`/forge/${id}`);
                setFormData({
                    title: data.title,
                    type: data.type,
                    url: data.url,
                    description: data.description,
                    tags: data.tags,
                    difficulty: data.difficulty,
                    isExternal: typeof data.isExternal === 'boolean' ? data.isExternal : !!data.url,
                    content: data.content || '',
                });
            } catch (err) {
                setError('Failed to fetch resource');
            } finally {
                setIsLoading(false);
            }
        };
        fetchResource();
    }, [id, apiFetch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch(`/forge/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
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