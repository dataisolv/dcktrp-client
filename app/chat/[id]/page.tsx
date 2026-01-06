'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import ChatSettingsPanel, { ChatSettings } from '@/components/chat/ChatSettingsPanel';
import { conversationsApi } from '@/lib/api/conversations';
import { chatApi } from '@/lib/api/chat';
import { useConversations } from '@/contexts/ConversationsContext';
import { Message } from '@/types';
import { toast } from 'sonner';

export default function ChatConversationPage() {
    const params = useParams();
    const router = useRouter();
    const conversationIdFromUrl = params.id ? parseInt(params.id as string) : null;

    const { conversations, isLoading: isLoadingConversations, addConversation, removeConversation, updateConversation: updateConversationInContext } = useConversations();

    const [currentConversationId, setCurrentConversationId] = useState<number | null>(conversationIdFromUrl);
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasAttachments, setHasAttachments] = useState(false);

    // Chat settings state
    const [settings, setSettings] = useState<ChatSettings>({
        mode: 'global',
        local_k: 5,
        global_k: 10,
        include_references: true,
        division_filter: [],
        access_filter: ['external'],
    });

    // Sync URL with conversation ID
    useEffect(() => {
        if (conversationIdFromUrl !== currentConversationId) {
            setCurrentConversationId(conversationIdFromUrl);
        }
    }, [conversationIdFromUrl]);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversationId) {
            loadMessages(currentConversationId);
        } else {
            setMessages([]);
        }
    }, [currentConversationId, conversations]);

    // Check if conversation exists when conversations load
    useEffect(() => {
        if (!isLoadingConversations && conversationIdFromUrl && conversations.length > 0) {
            const exists = conversations.find(c => c.id === conversationIdFromUrl);
            if (!exists) {
                router.push('/chat');
            }
        }
    }, [isLoadingConversations, conversations, conversationIdFromUrl, router]);

    const loadMessages = async (conversationId: number) => {
        try {
            setIsLoadingMessages(true);
            const data = await conversationsApi.getMessages(conversationId);
            const transformedMessages = data.map(msg => ({
                ...msg,
                fileMetadata: msg.metadata?.files || undefined
            }));
            setMessages(transformedMessages);

            // Load conversation settings from metadata
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation?.metadata?.chatSettings) {
                setSettings(conversation.metadata.chatSettings);
            }
        } catch (error: any) {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleNewConversation = async () => {
        router.push('/chat');
    };

    const handleSelectConversation = (conversationId: number) => {
        if (conversationId !== currentConversationId) {
            router.push(`/chat/${conversationId}`);
        }
    };

    const handleDeleteConversation = async (conversationId: number) => {
        try {
            await conversationsApi.deleteConversation(conversationId);
            removeConversation(conversationId);

            if (currentConversationId === conversationId) {
                const remaining = conversations.filter((c) => c.id !== conversationId);
                if (remaining.length > 0) {
                    router.push(`/chat/${remaining[0].id}`);
                } else {
                    router.push('/chat');
                }
            }

            toast.success('Conversation deleted');
        } catch (error: any) {
            console.error('Failed to delete conversation:', error);
            toast.error('Failed to delete conversation');
        }
    };

    const handleSendMessage = async (content: string, files?: File[]) => {
        setHasAttachments(false);
        await sendMessage(currentConversationId, content, files);
    };

    const sendMessage = async (conversationId: number | null, content: string, files?: File[]) => {
        try {
            setIsSending(true);

            // Add user message to UI immediately
            const optimisticUserMessage: Message = {
                id: Date.now(),
                conversation_id: conversationId || 0,
                role: 'user',
                content: content,
                created_at: new Date().toISOString(),
                metadata: {},
                fileMetadata: files?.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                })),
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

            await chatApi.streamQuery(
                {
                    query: content,
                    mode: files && files.length > 0 ? 'bypass' : settings.mode,
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
                    if (returnedConversationId) {
                        // Add the final assistant message to messages array
                        const finalAssistantMessage: Message = {
                            id: Date.now() + 1,
                            conversation_id: returnedConversationId,
                            role: 'assistant',
                            content: fullResponse,
                            created_at: new Date().toISOString(),
                            metadata: {},
                        };

                        setMessages((prev) => [...prev, finalAssistantMessage]);
                        setStreamingMessage(null);

                        // Update conversation's updated_at in the sidebar (no full reload)
                        updateConversationInContext(returnedConversationId, {
                            updated_at: new Date().toISOString(),
                        });

                        // Handle new conversation created from this page (shouldn't happen often)
                        if (!conversationId && returnedConversationId) {
                            setCurrentConversationId(returnedConversationId);
                            router.push(`/chat/${returnedConversationId}`, { scroll: false });

                            // Fetch and add new conversation
                            try {
                                const conversationDetails = await conversationsApi.getConversation(returnedConversationId);
                                if (conversationDetails) {
                                    addConversation(conversationDetails);
                                }
                            } catch (error) {
                                console.error('Failed to fetch conversation:', error);
                            }

                            const settingsToSave = files && files.length > 0
                                ? { ...settings, mode: 'bypass' as const }
                                : settings;

                            try {
                                await conversationsApi.updateConversation(
                                    returnedConversationId,
                                    undefined,
                                    { chatSettings: settingsToSave }
                                );
                            } catch (error) {
                                console.error('Failed to save settings:', error);
                            }
                        }
                    } else {
                        setStreamingMessage(null);
                    }
                },
                files
            );
        } catch (error: any) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const currentConversation = conversations.find((c) => c.id === currentConversationId);

    return (
        <ProtectedRoute>
            <div className="flex h-screen max-h-screen overflow-hidden">
                <ConversationSidebar
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    isLoading={isLoadingConversations}
                />
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-h-0">
                    {/* Header with settings */}
                    <div className="border-b px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-950 flex-shrink-0">
                        <h1 className="text-lg font-semibold">
                            {currentConversation?.title || 'Chat'}
                        </h1>
                        <ChatSettingsPanel
                            settings={settings}
                            onSettingsChange={setSettings}
                            hasAttachments={hasAttachments}
                        />
                    </div>

                    <MessageList
                        messages={messages}
                        isLoading={isLoadingMessages}
                        streamingMessage={streamingMessage}
                    />
                    <MessageInput
                        onSend={handleSendMessage}
                        disabled={isSending}
                        onAttachmentsChange={setHasAttachments}
                    />
                </div>
            </div>
        </ProtectedRoute>
    );
}

