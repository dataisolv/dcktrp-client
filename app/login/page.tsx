'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setUserId: setAuthUserId } = useAuth();

    // Auto-generate a temporary user_id if none exists
    useEffect(() => {
        const storedUserId = localStorage.getItem('sso_user_id');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            // Generate a unique user_id for testing
            const tempUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            setUserId(tempUserId);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId || userId.trim() === '') {
            toast.error('Please enter a valid user ID');
            return;
        }

        setIsLoading(true);
        try {
            await setAuthUserId(userId.trim());
            toast.success('Login successful!');
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
            toast.error(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Welcome
                    </CardTitle>
                    <CardDescription className="text-base">
                        Enter your User ID to continue
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="userId" className="text-sm font-medium">
                                User ID
                            </Label>
                            <Input
                                id="userId"
                                type="text"
                                placeholder="Enter your SSO User ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                disabled={isLoading}
                                className="h-11 font-mono"
                                autoComplete="username"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                In production, this will be provided by your SSO system.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Continue'
                            )}
                        </Button>
                        <p className="text-center text-xs text-gray-500">
                            Your user_id will be sent to the RAG system via X-User-ID header
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
