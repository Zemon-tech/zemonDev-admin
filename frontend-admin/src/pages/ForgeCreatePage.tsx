import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ForgeResourceForm from './ForgeResourceForm';
import type { IForgeResourceData } from './ForgeResourceForm';

const ForgeCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<IForgeResourceData>({
        title: '',
        type: 'article',
        url: '',
        description: '',
        tags: [],
        difficulty: 'intermediate',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/forge', formData);
            navigate('/admin/forge');
        } catch (err) {
            console.error('Failed to create resource', err);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Create New Resource</h1>
            <ForgeResourceForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
        </div>
    );
};

export default ForgeCreatePage; 