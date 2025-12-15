'use client';

import { Message as MessageType } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
    message: MessageType;
    isStreaming?: boolean;
}

export default function Message({ message, isStreaming }: MessageProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={cn(
                'flex gap-3 px-4 py-6',
                isUser ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-900'
            )}
        >
            <Avatar className={cn('h-8 w-8 flex-shrink-0', isUser ? 'bg-blue-600' : 'bg-indigo-600')}>
                <AvatarFallback className="text-white text-sm font-medium">
                    {isUser ? 'U' : 'AI'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                        {isUser ? 'You' : 'Assistant'}
                    </span>
                    {message.created_at && !isStreaming && (
                        <span className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                    )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    )}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                    )}
                </div>
            </div>
        </div>
    );
}
