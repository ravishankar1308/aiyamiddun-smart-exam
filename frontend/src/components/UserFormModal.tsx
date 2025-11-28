
// components/UserFormModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiCreateUser, apiUpdateUser } from '@/lib/api';
import { X } from 'lucide-react';

export default function UserFormModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!user;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: user.name,
        username: user.username,
        password: '', // Password is not sent for editing unless it's being changed
        confirmPassword: '',
        role: user.role,
      });
    }
  }, [user, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isEditMode && formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    
    if (isEditMode && formData.password && formData.password.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
    }

    setLoading(true);
    try {
        const { confirmPassword, ...userData } = formData;
        // Only include the password if it's being set
        if (!userData.password) {
            delete userData.password;
        }

        if (isEditMode) {
            await apiUpdateUser(user.id, userData);
        } else {
            await apiCreateUser(userData);
        }
        onClose(); // Close the modal on success
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit User' : 'Add New User'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <X size={24} />
            </button>
        </div>
        
        <form onSubmit={handleSubmit}>
            {/* Form fields... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg bg-gray-200" disabled/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        {isEditMode ? 'New Password (optional)' : 'Password'}
                    </label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required={!isEditMode} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required={!!formData.password} className="w-full px-3 py-2 border rounded-lg"/>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Role</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm italic my-4">{error}</p>}

            <div className="flex justify-end mt-6">
                <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg mr-2">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" disabled={loading}>
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update User' : 'Create User')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
