import apiClient from '../api-client';
import { Conversation, Message } from '@/types';

export const conversationsApi = {
    async getConversations(skip = 0, limit = 50): Promise<Conversation[]> {
        const response = await apiClient.get<Conversation[]>('/conversations/', {
            params: { skip, limit },
        });
        return response.data;
    },

    async createConversation(title?: string, metadata?: Record<string, any>): Promise<Conversation> {
        const response = await apiClient.post<Conversation>('/conversations/', {
            title,
            metadata: metadata || {},
        });
        return response.data;
    },

    async getConversation(conversationId: number): Promise<Conversation> {
        const response = await apiClient.get<Conversation>(`/conversations/${conversationId}`);
        return response.data;
    },

    async updateConversation(
        conversationId: number,
        title?: string,
        metadata?: Record<string, any>
    ): Promise<Conversation> {
        const response = await apiClient.patch<Conversation>(`/conversations/${conversationId}`, {
            title,
            metadata,
        });
        return response.data;
    },

    async deleteConversation(conversationId: number): Promise<void> {
        await apiClient.delete(`/conversations/${conversationId}`);
    },

    async getMessages(conversationId: number, skip = 0, limit = 100): Promise<Message[]> {
        const response = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`, {
            params: { skip, limit },
        });
        return response.data;
    },

    async createMessage(
        conversationId: number,
        role: 'user' | 'assistant' | 'system',
        content: string,
        metadata?: Record<string, any>
    ): Promise<Message> {
        const response = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, {
            role,
            content,
            metadata: metadata || {},
        });
        return response.data;
    },

    async deleteMessage(conversationId: number, messageId: number): Promise<void> {
        await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`);
    },
};
