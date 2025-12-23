'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/utils/storage';

interface User {
    user_id: string;
    username?: string;
    email?: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUserId: (userId: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    useEffect(() => {
        // Check for existing user_id from SSO
        const initAuth = async () => {
            console.log('🔄 AuthContext - Initializing SSO auth...');
            const userId = storage.getUserId();
            console.log('🔄 AuthContext - User ID from storage:', userId || '❌ NULL');
            
            if (userId) {
                // Create user object from stored user_id
                const userData: User = {
                    user_id: userId,
                    username: userId,
                };
                console.log('✅ AuthContext - Setting user:', userData);
                setUser(userData);
                storage.setUser(userData);
            } else {
                console.log('❌ AuthContext - No user_id found in storage');
            }
            
            setIsLoading(false);
            console.log('✅ AuthContext - Initialization complete, isAuthenticated:', !!userId);
        };

        initAuth();
    }, []);

    const setUserId = async (userId: string) => {
        try {
            console.log('🔑 Setting user_id:', userId);
            
            // Store user_id (from SSO or manual entry)
            storage.setUserId(userId);
            console.log('✅ Saved user_id to localStorage');
            
            // Create user object
            const userData: User = {
                user_id: userId,
                username: userId,
            };
            
            setUser(userData);
            storage.setUser(userData);
            console.log('✅ Updated React state with user:', userData);

            console.log('🚀 Redirecting to /chat...');
            
            // Use router.push for soft navigation (no page reload)
            // This ensures the AuthContext state is preserved
            router.push('/chat');
        } catch (error) {
            console.error('❌ Set user_id failed:', error);
            throw error;
        }
    };

    const logout = () => {
        storage.clear();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                setUserId,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
