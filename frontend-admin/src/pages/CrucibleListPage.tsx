import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useApi } from '../lib/api';

interface ICrucibleProblem {
    _id: string;
    title: string;
    difficulty: string;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    learningObjectives?: string[];
    prerequisites?: string[];
}

const CrucibleListPage: React.FC = () => {
    const [problems, setProblems] = useState<ICrucibleProblem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [problemToDelete, setProblemToDelete] = useState<ICrucibleProblem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const apiFetch = useApi();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const data = await apiFetch('/crucible/problems');
                setProblems(data);
            } catch (err) {
                setError('Failed to fetch problems');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblems();
    }, [apiFetch]);

    const handleDelete = async () => {
        if (!problemToDelete) return;
        try {
            await apiFetch(`/crucible/problems/${problemToDelete._id}`, { method: 'DELETE' });
            setProblems(problems.filter(p => p._id !== problemToDelete._id));
            setProblemToDelete(null);
        } catch (err) {
            console.error('Failed to delete problem', err);
        }
    };

    const filteredProblems = problems?.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDifficulty = filterDifficulty === 'all' || problem.difficulty === filterDifficulty;
        const matchesStatus = filterStatus === 'all' || problem.status === filterStatus;
        
        return matchesSearch && matchesDifficulty && matchesStatus;
    });

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'published': return 'badge-success';
            case 'draft': return 'badge-warning';
            case 'archived': return 'badge-ghost';
            default: return 'badge-outline';
        }
    };

    const getDifficultyBadgeClass = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'badge-info';
            case 'medium': return 'badge-warning';
            case 'hard': return 'badge-error';
            case 'expert': return 'badge-error text-white';
            default: return 'badge-outline';
        }
    };

    if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div className="alert alert-error">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Crucible Problems</h1>
                <Link to="/admin/crucible/create" className="btn btn-primary">
                    <Plus size={16} className="mr-2" />
                    Create Problem
                </Link>
            </div>

            <div className="bg-base-100 shadow-lg rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="form-control flex-1">
                        <label className="label">
                            <span className="label-text">Search</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search by title or tags..." 
                                className="input input-bordered w-full pr-10" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Difficulty</span>
                        </label>
                        <select 
                            className="select select-bordered" 
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                        >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Status</span>
                        </label>
                        <select 
                            className="select select-bordered" 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Difficulty</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems?.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">
                                    No problems found matching your filters
                                </td>
                            </tr>
                        ) : (
                            filteredProblems?.map((problem: ICrucibleProblem) => (
                                <tr key={problem._id}>
                                    <td className="font-medium">{problem.title}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(problem.status)}`}>
                                            {problem.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {problem.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="badge badge-outline">{tag}</span>
                                            ))}
                                            {problem.tags.length > 3 && (
                                                <span className="badge badge-outline">+{problem.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <Link to={`/admin/crucible/edit/${problem._id}`} className="btn btn-sm btn-outline">
                                                <Edit size={14} className="mr-1" /> Edit
                                            </Link>
                                            <button onClick={() => setProblemToDelete(problem)} className="btn btn-sm btn-outline btn-error">
                                                <Trash2 size={14} className="mr-1" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {problemToDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Problem</h3>
                        <p className="py-4">Are you sure you want to delete "{problemToDelete.title}"?</p>
                        <div className="modal-action">
                            <button onClick={() => setProblemToDelete(null)} className="btn">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-error">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrucibleListPage; 