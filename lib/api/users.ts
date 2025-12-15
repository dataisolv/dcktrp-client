import apiClient from '../api-client';
import { User, RegisterRequest } from '@/types';

export const usersApi = {
    async register(data: RegisterRequest): Promise<User> {
        const response = await apiClient.post<User>('/api/users/', data);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/api/users/me');
        return response.data;
    },
};
