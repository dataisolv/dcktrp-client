'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { conversationsApi } from '@/lib/api/conversations';
import { Conversation } from '@/types';
import { toast } from 'sonner';

interface ConversationsContextType {
    conversations: Conversation[];
    isLoading: boolean;
    loadConversations: () => Promise<void>;
    addConversation: (conversation: Conversation) => void;
    updateConversation: (id: number, updates: Partial<Conversation>) => void;
    removeConversation: (id: number) => void;
}

const ConversationsContext = createContext<ConversationsContextType | null>(null);

export function ConversationsProvider({ children }: { children: ReactNode }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);

    const loadConversations = useCallback(async () => {
        // Only show loading on initial load
        if (!hasLoaded) {
            setIsLoading(true);
        }
        try {
            const data = await conversationsApi.getConversations();
            setConversations(data);
            setHasLoaded(true);
        } catch (error: any) {
            console.error('Failed to load conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    }, [hasLoaded]);

    // Add a new conversation to the top of the list (optimistic update)
    const addConversation = useCallback((conversation: Conversation) => {
        setConversations(prev => {
            // Check if conversation already exists
            const exists = prev.find(c => c.id === conversation.id);
            if (exists) {
                // Update existing
                return prev.map(c => c.id === conversation.id ? conversation : c);
            }
            // Add to top
            return [conversation, ...prev];
        });
    }, []);

    // Update a conversation in the list
    const updateConversation = useCallback((id: number, updates: Partial<Conversation>) => {
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, ...updates } : c)
        );
    }, []);

    // Remove a conversation from the list
    const removeConversation = useCallback((id: number) => {
        setConversations(prev => prev.filter(c => c.id !== id));
    }, []);

    // Load conversations on mount (only once)
    useEffect(() => {
        if (!hasLoaded) {
            loadConversations();
        }
    }, [hasLoaded, loadConversations]);

    return (
        <ConversationsContext.Provider value={{
            conversations,
            isLoading,
            loadConversations,
            addConversation,
            updateConversation,
            removeConversation,
        }}>
            {children}
        </ConversationsContext.Provider>
    );
}

export function useConversations() {
    const context = useContext(ConversationsContext);
    if (!context) {
        throw new Error('useConversations must be used within a ConversationsProvider');
    }
    return context;
}
