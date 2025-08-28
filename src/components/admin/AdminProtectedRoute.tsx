'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Debug logging
    console.log('=== AdminProtectedRoute Debug ===');
    console.log('Status:', status);
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    console.log('Role type:', typeof session?.user?.role);
    console.log('Is ADMIN?:', session?.user?.role === 'ADMIN');
    console.log('================================');

    if (status === 'loading') return;

    if (!session) {
      console.log('No session - redirecting to login');
      router.push('/admin/login');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      console.log('Not ADMIN role - redirecting to home. Role is:', session.user?.role);
      router.push('/');
    }
  }, [status, session, router]);

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // While redirecting due to missing/invalid session, render nothing
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  console.log('Access granted - showing admin dashboard');
  // User is authenticated and has ADMIN role
  return <>{children}</>;
}
