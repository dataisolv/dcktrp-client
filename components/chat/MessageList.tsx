'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Message from './Message';

interface MessageListProps {
    messages: MessageType[];
    isLoading?: boolean;
    streamingMessage?: MessageType | null;
}

export default function MessageList({ messages, isLoading, streamingMessage }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom within the container only
        if (scrollRef.current) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            });
        }
    }, [messages, streamingMessage]);

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (messages.length === 0 && !streamingMessage) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center space-y-3">
                    <div className="text-5xl">💬</div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Start a conversation
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Ask me anything! I&apos;m here to help you with information from the knowledge base.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="flex flex-col">
                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
                {streamingMessage && streamingMessage.content === '' ? (
                    // Show thinking indicator when streaming starts but no content yet
                    <div className="flex gap-3 px-4 py-6 bg-slate-50 dark:bg-slate-900">
                        <div className="h-8 w-8 flex-shrink-0 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">AI</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">DCKTRP AI</span>
                            </div>
                            <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">Thinking...</span>
                            </div>
                        </div>
                    </div>
                ) : streamingMessage ? (
                    <Message message={streamingMessage} isStreaming={true} />
                ) : null}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
