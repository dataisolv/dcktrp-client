'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('ProtectedRoute - Redirecting to /login');
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Don't render children until authentication is confirmed
    // This prevents API calls from being made before user_id is available
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        {isLoading ? 'Loading...' : 'Redirecting...'}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
