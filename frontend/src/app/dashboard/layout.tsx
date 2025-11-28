
// app/dashboard/layout.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is not loading and there's no user, redirect to the login page.
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // While loading or if no user is authenticated yet, show a loader.
  // This prevents a flash of the dashboard content before the redirect happens.
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold">Loading session...</p>
      </div>
    );
  }

  // If the user is authenticated, render the full dashboard layout.
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-grow p-8">
        {children}
      </main>
    </div>
  );
}

