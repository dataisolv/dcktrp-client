'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ChatPage() {
    const router = useRouter();
    const { conversations, isLoading: isLoadingConversations, addConversation, removeConversation } = useConversations();

    const [messages, setMessages] = useState<Message[]>([]);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [hasAttachments, setHasAttachments] = useState(false);

    // Chat settings state (for new conversations)
    const [settings, setSettings] = useState<ChatSettings>({
        mode: 'global',
        local_k: 5,
        global_k: 10,
        include_references: true,
        division_filter: [],
        access_filter: ['external'],
    });

    const handleNewConversation = async () => {
        // Already on /chat, just reset state
        setMessages([]);
        setSettings({
            mode: 'global',
            local_k: 5,
            global_k: 10,
            include_references: true,
            division_filter: [],
            access_filter: ['external'],
        });
        toast.success('Start typing to begin a new conversation');
    };

    const handleSelectConversation = (conversationId: number) => {
        // Navigate to dynamic route
        router.push(`/chat/${conversationId}`);
    };

    const handleDeleteConversation = async (conversationId: number) => {
        try {
            await conversationsApi.deleteConversation(conversationId);
            removeConversation(conversationId);
            toast.success('Conversation deleted');
        } catch (error: any) {
            console.error('Failed to delete conversation:', error);
            toast.error('Failed to delete conversation');
        }
    };

    const handleSendMessage = async (content: string, files?: File[]) => {
        setHasAttachments(false);
        await sendMessage(content, files);
    };

    const sendMessage = async (content: string, files?: File[]) => {
        try {
            setIsSending(true);

            // Add user message to UI immediately (optimistic update)
            const optimisticUserMessage: Message = {
                id: Date.now(),
                conversation_id: 0,
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
                conversation_id: 0,
                role: 'assistant',
                content: '',
                created_at: new Date().toISOString(),
                metadata: {},
            };
            setStreamingMessage(tempAssistantMessage);

            let fullResponse = '';
            let returnedConversationId: number | null = null;
            let newConversationTitle: string | null = null;

            // Stream the response
            await chatApi.streamQuery(
                {
                    query: content,
                    mode: files && files.length > 0 ? 'bypass' : settings.mode,
                    stream: true,
                    include_references: settings.include_references,
                    local_k: settings.local_k,
                    global_k: settings.global_k,
                    conversation_id: undefined,
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
                    setStreamingMessage(null);

                    if (returnedConversationId) {
                        const settingsToSave = files && files.length > 0
                            ? { ...settings, mode: 'bypass' as const }
                            : settings;

                        try {
                            // Get the conversation details to add to sidebar
                            const conversationDetails = await conversationsApi.getConversation(returnedConversationId);
                            if (conversationDetails) {
                                // Add the new conversation to the top of the list smoothly
                                addConversation(conversationDetails);
                            }

                            await conversationsApi.updateConversation(
                                returnedConversationId,
                                undefined,
                                { chatSettings: settingsToSave }
                            );
                        } catch (error) {
                            console.error('Failed to save settings:', error);
                        }

                        // Navigate to the new conversation
                        router.push(`/chat/${returnedConversationId}`);
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

    return (
        <ProtectedRoute>
            <div className="flex h-screen max-h-screen overflow-hidden">
                <ConversationSidebar
                    conversations={conversations}
                    currentConversationId={null}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                    isLoading={isLoadingConversations}
                />
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-h-0">
                    {/* Header with settings */}
                    <div className="border-b px-4 py-3 flex items-center justify-between bg-white dark:bg-slate-950 flex-shrink-0">
                        <h1 className="text-lg font-semibold">New Chat</h1>
                        <ChatSettingsPanel
                            settings={settings}
                            onSettingsChange={setSettings}
                            hasAttachments={hasAttachments}
                        />
                    </div>

                    <MessageList
                        messages={messages}
                        isLoading={false}
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

