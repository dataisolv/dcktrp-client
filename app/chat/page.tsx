'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { conversationsApi } from '@/lib/api/conversations';
import { chatApi } from '@/lib/api/chat';
import { Conversation, Message } from '@/types';
import { toast } from 'sonner';

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId);
        } else {
            setMessages([]);
        }
    }, [currentConversationId]);

    const loadConversations = async () => {
        try {
            setIsLoadingConversations(true);
            const data = await conversationsApi.getConversations();
            setConversations(data);

            // Select first conversation if none selected
            if (!currentConversationId && data.length > 0) {
                setCurrentConversationId(data[0].id);
            }
        } catch (error: any) {
            console.error('Failed to load conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const loadMessages = async (conversationId: number) => {
        try {
            setIsLoadingMessages(true);
            const data = await conversationsApi.getMessages(conversationId);
            setMessages(data);
        } catch (error: any) {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleNewConversation = async () => {
        try {
            const newConversation = await conversationsApi.createConversation();
            setConversations([newConversation, ...conversations]);
            setCurrentConversationId(newConversation.id);
            setMessages([]);
            toast.success('New conversation created');
        } catch (error: any) {
            console.error('Failed to create conversation:', error);
            toast.error('Failed to create conversation');
        }
    };

    const handleSelectConversation = (conversationId: number) => {
        setCurrentConversationId(conversationId);
    };

    const handleDeleteConversation = async (conversationId: number) => {
        try {
            await conversationsApi.deleteConversation(conversationId);
            setConversations(conversations.filter((c) => c.id !== conversationId));

            if (currentConversationId === conversationId) {
                const remaining = conversations.filter((c) => c.id !== conversationId);
                setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
            }

            toast.success('Conversation deleted');
        } catch (error: any) {
            console.error('Failed to delete conversation:', error);
            toast.error('Failed to delete conversation');
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!currentConversationId) {
            // Create new conversation if none exists
            try {
                const newConversation = await conversationsApi.createConversation();
                setConversations([newConversation, ...conversations]);
                setCurrentConversationId(newConversation.id);

                // Continue with sending the message
                await sendMessage(newConversation.id, content);
            } catch (error: any) {
                console.error('Failed to create conversation:', error);
                toast.error('Failed to create conversation');
            }
        } else {
            await sendMessage(currentConversationId, content);
        }
    };

    const sendMessage = async (conversationId: number, content: string) => {
        try {
            setIsSending(true);

            // Create user message
            const userMessage = await conversationsApi.createMessage(
                conversationId,
                'user',
                content
            );
            setMessages((prev) => [...prev, userMessage]);

            // Initialize streaming assistant message
            const tempAssistantMessage: Message = {
                id: Date.now(), // Temporary ID
                conversation_id: conversationId,
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                metadata: {},
            };
            setStreamingMessage(tempAssistantMessage);

            let fullResponse = '';

            // Stream the response
            await chatApi.streamQuery(
                {
                    query: content,
                    mode: 'mix',
                    stream: true,
                    include_references: true,
                    local_k: 5,
                    global_k: 10,
                    conversation_history: messages.slice(-3).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
                (chunk) => {
                    if (chunk.response) {
                        fullResponse += chunk.response;
                        setStreamingMessage({
                            ...tempAssistantMessage,
                            content: fullResponse,
                        });
                    }
                },
                (error) => {
                    console.error('Stream error:', error);
                    toast.error('Failed to get response');
                    setStreamingMessage(null);
                },
                async () => {
                    // Save assistant message to conversation
                    try {
                        const assistantMessage = await conversationsApi.createMessage(
                            conversationId,
                            'assistant',
                            fullResponse
                        );
                        setMessages((prev) => [...prev, assistantMessage]);
                        setStreamingMessage(null);

                        // Update conversation title if it's the first message
                        const conv = conversations.find((c) => c.id === conversationId);
                        if (conv && !conv.title) {
                            const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
                            await conversationsApi.updateConversation(conversationId, title);
                            setConversations((prev) =>
                                prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
                            );
                        }
                    } catch (error) {
                        console.error('Failed to save assistant message:', error);
                    }
                }
            );
        } catch (error: any) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden">
                <ConversationSidebar
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    isLoading={isLoadingConversations}
                />
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
                    <MessageList
                        messages={messages}
                        isLoading={isLoadingMessages}
                        streamingMessage={streamingMessage}
                    />
                    <MessageInput onSend={handleSendMessage} disabled={isSending} />
                </div>
            </div>
        </ProtectedRoute>
    );
}
