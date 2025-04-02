// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard'); // User is logged in, go to dashboard
      } else {
        router.replace('/auth/login'); // User is not logged in, go to login
      }
    }
  }, [user, isLoading, router]);

  // Show loading indicator while checking auth state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}