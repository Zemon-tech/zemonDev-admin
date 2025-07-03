import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

interface IUser {
    _id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'user';
}

const UserEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isLoading, error } = useFetch<IUser>(`/users/${id}`);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
            setEmail(user.email);
            setRole(user.role);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/users/${id}`, { fullName, email, role });
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