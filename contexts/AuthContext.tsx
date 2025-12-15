'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginRequest } from '@/types';
import { authApi } from '@/lib/api/auth';
import { usersApi } from '@/lib/api/users';
import { storage } from '@/lib/utils/storage';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user;

    useEffect(() => {
        // Check for existing token and load user
        const initAuth = async () => {
            console.log('AuthContext - Initializing auth...');
            const token = storage.getToken();
            console.log('AuthContext - Token from storage:', token ? 'exists' : 'null');
            if (token) {
                try {
                    console.log('AuthContext - Fetching user data...');
                    const userData = await usersApi.getCurrentUser();
                    console.log('AuthContext - User data fetched:', userData);
                    setUser(userData);
                } catch (error) {
                    console.error('AuthContext - Failed to load user:', error);
                    storage.clear();
                }
            }
            setIsLoading(false);
            console.log('AuthContext - Initialization complete');
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            console.log('Starting login...');
            const response = await authApi.login(credentials);
            console.log('Login response:', response);
            storage.setToken(response.access_token);

            // Fetch user data
            console.log('Fetching user data...');
            const userData = await usersApi.getCurrentUser();
            console.log('User data:', userData);
            setUser(userData);
            storage.setUser(userData);

            console.log('Redirecting to /chat...');
            // Use window.location for hard navigation to ensure fresh auth check
            window.location.href = '/chat';
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        storage.clear();
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        try {
            const userData = await usersApi.getCurrentUser();
            setUser(userData);
            storage.setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                refreshUser,
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
