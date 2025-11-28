
'use client';

import { useEffect, useState } from 'react';
import { apiGetUsers, apiToggleUserDisable, apiDeleteUser } from '@/lib/api';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserFormModal from '@/components/UserFormModal';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await apiGetUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleDisable = async (userId: number, currentStatus: boolean) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'enable' : 'disable'} this user?`)) return;
        try {
            await apiToggleUserDisable(userId);
            fetchUsers(); // Re-fetch to update the UI
        } catch (err: any) {
            alert(err.message || "Failed to update user status.");
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await apiDeleteUser(userId);
            fetchUsers(); // Re-fetch to update the UI
        } catch (err: any) {
            alert(err.message || "Failed to delete user.");
        }
    };

    const openModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh data when modal closes
    };
    
    // Render loading and error states
    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
                <button 
                    onClick={() => openModal()} 
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                >
                    <Plus size={20} />
                    Add User
                </button>
            </div>

            {/* User table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: any) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.disabled ? 'Disabled' : 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleToggleDisable(user.id, user.disabled)} className="text-gray-400 hover:text-gray-600 mr-2" title={user.disabled ? 'Enable User' : 'Disable User'}>
                                        {user.disabled ? <ToggleLeft size={20}/> : <ToggleRight size={20}/>}
                                    </button>
                                    <button onClick={() => openModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-2" title="Edit User">
                                        <Edit size={20} />
                                    </button>
                                    {currentUser?.id !== user.id && (
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Delete User">
                                        <Trash2 size={20} />
                                    </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserFormModal 
                    user={selectedUser} 
                    onClose={closeModal} 
                />
            )} 
        </div>
    );
}
