import apiClient from '../api-client';
import { User, RegisterRequest } from '@/types';

export const usersApi = {
    async register(data: RegisterRequest, adminToken?: string): Promise<User> {
        const response = await apiClient.post<User>('/users/', data, {
            headers: adminToken ? {
                'X-Admin-Token': adminToken,
            } : {},
        });
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await apiClient.get<User>('/users/me');
        return response.data;
    },
};
