'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingMessage]);

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-4">
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
        <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="flex flex-col">
                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
                {streamingMessage && (
                    <Message message={streamingMessage} isStreaming={true} />
                )}
                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
}
