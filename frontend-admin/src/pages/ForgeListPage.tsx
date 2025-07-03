import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

interface IForgeResource {
    _id: string;
    title: string;
    type: string;
    difficulty: string;
    metrics?: {
        views: number;
        bookmarks: number;
        rating: number;
    };
}

const ForgeListPage: React.FC = () => {
    const { data: resources, setData: setResources, isLoading, error } = useFetch<IForgeResource[]>('/forge');
    const [resourceToDelete, setResourceToDelete] = useState<IForgeResource | null>(null);

    const handleDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await api.delete(`/forge/${resourceToDelete._id}`);
            if(resources) {
                setResources(resources.filter(r => r._id !== resourceToDelete._id));
            }
            setResourceToDelete(null);
        } catch (err) {
            console.error('Failed to delete resource', err);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Forge Resources</h1>
                <Link to="/admin/forge/create" className="btn btn-primary">
                    <Plus size={16} className="mr-2" />
                    Create Resource
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Difficulty</th>
                            <th>Views</th>
                            <th>Bookmarks</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources?.map((resource: IForgeResource) => (
                            <tr key={resource._id}>
                                <td>{resource.title}</td>
                                <td>{resource.type}</td>
                                <td><span className="badge badge-outline">{resource.difficulty}</span></td>
                                <td>{resource.metrics?.views ?? 0}</td>
                                <td>{resource.metrics?.bookmarks ?? 0}</td>
                                <td>{resource.metrics?.rating?.toFixed(2) ?? '0.00'}</td>
                                <td className="flex gap-2">
                                    <Link to={`/admin/forge/edit/${resource._id}`} className="btn btn-sm btn-ghost"><Edit size={16} /></Link>
                                    <button onClick={() => setResourceToDelete(resource)} className="btn btn-sm btn-ghost text-error"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {resourceToDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Resource</h3>
                        <p className="py-4">Are you sure you want to delete "{resourceToDelete.title}"?</p>
                        <div className="modal-action">
                            <button onClick={() => setResourceToDelete(null)} className="btn">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-error">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForgeListPage; 