// app/dashboard/layout.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Sidebar from '@/components/navigation/Sidebar';
import BottomNavBar from '@/components/navigation/BottomNavBar'; // Import BottomNavBar
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('DashboardLayout: Not authenticated, redirecting to login.');
      router.replace('/auth/login');
    }
  }, [user, isLoading, router, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-gray-700 dark:text-gray-300" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    // Main container remains flex
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-white">
      {/* Sidebar: Rendered only on medium screens and up */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6"> {/* Add padding-bottom for mobile */}
        {children}
      </main>

      {/* Bottom Nav Bar: Rendered only on small screens */}
      <BottomNavBar />
    </div>
  );
}