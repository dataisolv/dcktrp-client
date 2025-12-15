'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MessageSquare, Trash2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentConversationId: number | null;
    onSelectConversation: (conversationId: number) => void;
    onNewConversation: () => void;
    onDeleteConversation: (conversationId: number) => void;
    isLoading?: boolean;
}

export default function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    isLoading,
}: ConversationSidebarProps) {
    const { user, logout } = useAuth();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (e: React.MouseEvent, conversationId: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            setDeletingId(conversationId);
            try {
                await onDeleteConversation(conversationId);
            } finally {
                setDeletingId(null);
            }
        }
    };

    return (
        <div className="w-80 border-r bg-slate-50 dark:bg-slate-900 flex flex-col h-screen">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        dcktrp Chat
                    </h2>
                </div>
                <Button
                    onClick={onNewConversation}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={isLoading}
                >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Chat
                </Button>
            </div>

            <Separator />

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 py-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 px-4 text-gray-500 dark:text-gray-400">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No conversations yet</p>
                            <p className="text-xs mt-1">Start a new chat to begin</p>
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm cursor-pointer transition-all',
                                    currentConversationId === conversation.id
                                        ? 'bg-white dark:bg-slate-800 shadow-sm'
                                        : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                                )}
                                onClick={() => onSelectConversation(conversation.id)}
                            >
                                <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium truncate">
                                        {conversation.title || 'Untitled Chat'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                                    onClick={(e) => handleDelete(e, conversation.id)}
                                    disabled={deletingId === conversation.id}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <Separator />

            <div className="p-4 space-y-3">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-slate-800">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full h-10 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
