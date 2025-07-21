import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../lib/api';

interface IUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'user';
}

const UserEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiFetch = useApi();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await apiFetch(`/users/${id}`);
                setUser(data);
                setFullName(data.fullName);
                setEmail(data.email);
                setRole(data.role);
            } catch (err) {
                setError('Failed to fetch user');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [id, apiFetch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ fullName, email, role }),
            });
            navigate('/admin/users');
        } catch (err) {
            console.error('Failed to update user', err);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit User</h1>
            <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-8">
                <div className="form-control">
                    <label className="label"><span className="label-text">Full Name</span></label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input input-bordered" />
                </div>
                <div className="form-control">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input input-bordered" />
                </div>
                <div className="form-control">
                    <label className="label"><span className="label-text">Role</span></label>
                    <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="select select-bordered">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="form-control mt-6">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default UserEditPage; 