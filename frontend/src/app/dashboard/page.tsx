
'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth(); // We get the user from the context

  return (
    <div>
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </header>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-2">
                <p><strong>Username:</strong> {user?.username}</p>
                <p>
                    <strong>Role:</strong> 
                    <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-0.5 rounded">
                        {user?.role}
                    </span>
                </p>
                <p><strong>Status:</strong> {user?.disabled ? 'Disabled' : 'Active'}</p>
            </div>
        </div>

        {/* We can add role-specific widgets here in the future */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <p className="text-gray-500">Navigation is available in the sidebar on the left.</p>
          {/* Add quick action buttons or links here based on user role */}
        </div>
    </div>
  );
}
