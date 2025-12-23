'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ChatSettingsPanel, { ChatSettings } from '@/components/chat/ChatSettingsPanel';
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

    // Chat settings state
    const [settings, setSettings] = useState<ChatSettings>({
        mode: 'global',
        local_k: 5,
        global_k: 10,
        include_references: true,
        division_filter: [],
        access_filter: ['external'], // Default to external
    });

    // Load conversations on mount (only after ProtectedRoute confirms auth)
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
        // Server will auto-create conversation if needed
        await sendMessage(currentConversationId, content);
    };

    const sendMessage = async (conversationId: number | null, content: string) => {
        try {
            setIsSending(true);

            // Add user message to UI immediately (optimistic update)
            const optimisticUserMessage: Message = {
                id: Date.now(),
                conversation_id: conversationId || 0,
                role: 'user',
                content: content,
                created_at: new Date().toISOString(),
                metadata: {},
            };
            setMessages((prev) => [...prev, optimisticUserMessage]);

            // Initialize streaming assistant message
            const tempAssistantMessage: Message = {
                id: Date.now() + 1,
                conversation_id: conversationId || 0,
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                metadata: {},
            };
            setStreamingMessage(tempAssistantMessage);

            let fullResponse = '';
            let returnedConversationId = conversationId;

            // Stream the response (server handles message persistence)
            await chatApi.streamQuery(
                {
                    query: content,
                    mode: settings.mode,
                    stream: true,
                    include_references: settings.include_references,
                    local_k: settings.local_k,
                    global_k: settings.global_k,
                    conversation_id: conversationId || undefined,
                    ...(settings.division_filter.length > 0 ? { division_filter: settings.division_filter } : {}),
                    ...(settings.access_filter.length > 0 ? { access_filter: settings.access_filter } : {}),
                    conversation_history: messages.slice(-3).map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                },
                (chunk) => {
                    // Handle conversation_id from server (auto-created)
                    if (chunk.conversation_id && !returnedConversationId) {
                        returnedConversationId = chunk.conversation_id;
                        setCurrentConversationId(chunk.conversation_id);
                    }
                    
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
                    // Streaming complete - finalize UI
                    setStreamingMessage(null);
                    
                    // Small delay to ensure server has saved messages
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Reload conversation list to get updated data
                    if (returnedConversationId) {
                        await loadConversations();
                        await loadMessages(returnedConversationId);
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
                    {/* Header with settings */}
                    <div className="border-b px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-950">
                        <h1 className="text-lg font-semibold">
                            {currentConversationId
                                ? conversations.find((c) => c.id === currentConversationId)?.title || 'Chat'
                                : 'New Chat'}
                        </h1>
                        <ChatSettingsPanel settings={settings} onSettingsChange={setSettings} />
                    </div>

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
