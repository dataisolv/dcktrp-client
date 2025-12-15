'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usersApi } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await usersApi.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name || undefined,
            });
            toast.success('Registration successful! Please log in.');
            router.push('/login');
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign up to start using dcktrp Chat
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-sm font-medium">
                                Full Name
                            </Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                type="text"
                                placeholder="Your full name (optional)"
                                value={formData.full_name}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="h-11"
                                autoComplete="new-password"
                            />
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
                                    Creating account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
