import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Link } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
}

const UserListPage: React.FC = () => {
  const { data: users, setData: setUsers, isLoading, error } = useFetch<IUser[]>('/users');
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
        await api.delete(`/users/${userToDelete._id}`);
        if(users) {
            setUsers(users.filter((u: IUser) => u._id !== userToDelete._id));
        }
        setUserToDelete(null);
    } catch (err) {
        console.error('Failed to delete user', err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user: IUser) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td><span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{user.role}</span></td>
                <td className="flex gap-2">
                  <Link to={`/admin/users/edit/${user._id}`} className="btn btn-sm btn-ghost">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => setUserToDelete(user)} className="btn btn-sm btn-ghost text-error">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">Are you sure you want to delete {userToDelete.fullName}?</p>
            <div className="modal-action">
              <button onClick={() => setUserToDelete(null)} className="btn">Cancel</button>
              <button onClick={handleDelete} className="btn btn-error">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage; 