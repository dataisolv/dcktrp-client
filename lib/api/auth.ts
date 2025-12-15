import apiClient from '../api-client';
import { LoginRequest, LoginResponse } from '@/types';

export const authApi = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await apiClient.post<LoginResponse>('/api/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    async getAuthStatus(): Promise<any> {
        const response = await apiClient.get('/auth-status');
        return response.data;
    },
};
