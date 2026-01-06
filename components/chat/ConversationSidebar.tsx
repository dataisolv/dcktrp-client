'use client';

import { useState } from 'react';
import { Conversation } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MessageSquare, Trash2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className={cn(
            "border-r bg-slate-50 dark:bg-slate-900 flex flex-col h-full min-h-0 transition-all duration-300",
            isCollapsed ? "w-16" : "w-80"
        )}>
            {/* Toggle button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-4 -right-3 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-slate-800 border shadow-md hover:bg-slate-100 dark:hover:bg-slate-700"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </Button>

            <div className="p-4 space-y-4 flex-shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Chat Testing
                        </h2>
                    </div>
                )}
                <Button
                    onClick={onNewConversation}
                    className={cn(
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
                        isCollapsed ? "w-10 h-10 p-0" : "w-full h-11"
                    )}
                    disabled={isLoading}
                    title="New Chat"
                >
                    <PlusCircle className={cn(isCollapsed ? "h-5 w-5" : "mr-2 h-5 w-5")} />
                    {!isCollapsed && "New Chat"}
                </Button>
            </div>

            <Separator />

            <ScrollArea className="flex-1 min-h-0 px-2">
                <div className="space-y-1 py-2">
                    {conversations.length === 0 ? (
                        !isCollapsed && (
                            <div className="text-center py-8 px-4 text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No conversations yet</p>
                                <p className="text-xs mt-1">Start a new chat to begin</p>
                            </div>
                        )
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className={cn(
                                    'group relative flex items-center rounded-lg text-sm cursor-pointer transition-all',
                                    isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
                                    currentConversationId === conversation.id
                                        ? 'bg-white dark:bg-slate-800 shadow-sm'
                                        : 'hover:bg-white/50 dark:hover:bg-slate-800/50'
                                )}
                                onClick={() => onSelectConversation(conversation.id)}
                                title={isCollapsed ? conversation.title || 'Untitled Chat' : undefined}
                            >
                                <MessageSquare className={cn("h-4 w-4 text-gray-500", isCollapsed ? "" : "flex-shrink-0")} />
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {(conversation.title || 'Untitled Chat').length > 30
                                                    ? `${(conversation.title || 'Untitled Chat').substring(0, 30)}...`
                                                    : (conversation.title || 'Untitled Chat')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 flex-shrink-0"
                                            onClick={(e) => handleDelete(e, conversation.id)}
                                            disabled={deletingId === conversation.id}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <Separator className="flex-shrink-0" />

            <div className={cn("p-4 space-y-3 flex-shrink-0", isCollapsed && "px-2")}>
                {user && !isCollapsed && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white dark:bg-slate-800">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {user.username?.[0]?.toUpperCase() || user.user_id[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.username || user.user_id}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <Button
                    variant="outline"
                    onClick={logout}
                    className={cn(
                        "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200",
                        isCollapsed ? "w-10 h-10 p-0" : "w-full h-10"
                    )}
                    title="Logout"
                >
                    <LogOut className={cn(isCollapsed ? "h-4 w-4" : "mr-2 h-4 w-4")} />
                    {!isCollapsed && "Logout"}
                </Button>
            </div>
        </div>
    );
}
