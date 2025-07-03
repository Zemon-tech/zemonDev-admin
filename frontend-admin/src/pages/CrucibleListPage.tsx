import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../services/api';

interface ICrucibleProblem {
    _id: string;
    title: string;
    difficulty: string;
    tags: string[];
}

const CrucibleListPage: React.FC = () => {
    const { data: problems, setData: setProblems, isLoading, error } = useFetch<ICrucibleProblem[]>('/crucible');
    const [problemToDelete, setProblemToDelete] = useState<ICrucibleProblem | null>(null);

    const handleDelete = async () => {
        if (!problemToDelete) return;
        try {
            await api.delete(`/crucible/${problemToDelete._id}`);
            if(problems) {
                setProblems(problems.filter(p => p._id !== problemToDelete._id));
            }
            setProblemToDelete(null);
        } catch (err) {
            console.error('Failed to delete problem', err);
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

            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Difficulty</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {problems?.map((problem: ICrucibleProblem) => (
                            <tr key={problem._id}>
                                <td>{problem.title}</td>
                                <td><span className="badge badge-outline">{problem.difficulty}</span></td>
                                <td>{problem.tags.join(', ')}</td>
                                <td className="flex gap-2">
                                    <Link to={`/admin/crucible/edit/${problem._id}`} className="btn btn-sm btn-ghost"><Edit size={16} /></Link>
                                    <button onClick={() => setProblemToDelete(problem)} className="btn btn-sm btn-ghost text-error"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
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