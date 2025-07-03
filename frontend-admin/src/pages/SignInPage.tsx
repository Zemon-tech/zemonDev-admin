import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const SignInPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.token) {
                login(response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Admin Login</h2>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleLogin}>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input
                                type="email"
                                placeholder="email"
                                className="input input-bordered"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Password</span></label>
                            <input
                                type="password"
                                placeholder="password"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary" type="submit">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignInPage; 