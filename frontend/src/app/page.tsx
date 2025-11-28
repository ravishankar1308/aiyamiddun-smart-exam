'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login, register, loading, user } = useAuth();
    const router = useRouter();

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (user) {
        return null; // Don't render the form during redirect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">{isLoginView ? 'Login' : 'Create an Account'}</h2>
                
                {isLoginView ? <LoginForm /> : <RegisterForm />}

                <p className="text-center text-gray-500 text-xs mt-4">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => setIsLoginView(!isLoginView)} 
                        className="font-bold text-blue-500 hover:text-blue-700 ml-1"
                    >
                        {isLoginView ? 'Sign up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
}

// --- Login Form Component ---
function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
                {loading ? 'Logging in...' : 'Sign In'}
            </button>
        </form>
    );
}

// --- Register Form Component ---
function RegisterForm() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState<string | null>(null);
    const { register, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        try {
            await register({ name, username, password, role });
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        }
    };

    return (
         <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-username">Username</label>
                <input id="reg-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
            </div>
             <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">I am a...</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-green-300">
                {loading ? 'Creating Account...' : 'Register'}
            </button>
        </form>
    );
}
