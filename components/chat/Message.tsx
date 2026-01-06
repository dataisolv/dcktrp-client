'use client';

import { Message as MessageType } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { useMemo } from 'react';

interface MessageProps {
    message: MessageType;
    isStreaming?: boolean;
}

interface FileAttachment {
    type: 'image' | 'pdf';
    name: string;
    displayText?: string;
}

export default function Message({ message, isStreaming }: MessageProps) {
    const isUser = message.role === 'user';

    // Extract file attachments from message content
    const { cleanContent, attachments } = useMemo(() => {
        const content = message.content;
        const attachments: FileAttachment[] = [];
        let cleanContent = content;

        // Match patterns like "[Image: filename.jpg]" or "[PDF File: filename.pdf - sent as 3 images]"
        const imagePattern = /\[Image:\s*([^\]]+)\]/g;
        const pdfPattern = /\[PDF File:\s*([^\]]+?)(?:\s*-\s*sent as \d+ images?)?\]/g;

        // Extract images
        let match;
        while ((match = imagePattern.exec(content)) !== null) {
            attachments.push({
                type: 'image',
                name: match[1].trim(),
            });
            cleanContent = cleanContent.replace(match[0], '');
        }

        // Extract PDFs
        while ((match = pdfPattern.exec(content)) !== null) {
            const fullMatch = match[0];
            const fileName = match[1].trim();
            attachments.push({
                type: 'pdf',
                name: fileName,
                displayText: fullMatch,
            });
            cleanContent = cleanContent.replace(match[0], '');
        }

        // Also include fileMetadata from database (if available)
        if (message.fileMetadata && message.fileMetadata.length > 0) {
            message.fileMetadata.forEach(file => {
                // Only add if not already extracted from content
                const alreadyExists = attachments.some(a => a.name === file.name);
                if (!alreadyExists) {
                    attachments.push({
                        type: file.type.startsWith('image/') ? 'image' : 'pdf',
                        name: file.name
                    });
                }
            });
        }

        return { cleanContent: cleanContent.trim(), attachments };
    }, [message.content, message.fileMetadata]);

    return (
        <div
            className={cn(
                'flex gap-3 px-4 py-6',
                isUser ? 'flex-row-reverse bg-transparent' : 'flex-row bg-slate-50 dark:bg-slate-900'
            )}
        >
            <Avatar className={cn('h-8 w-8 flex-shrink-0', isUser ? 'bg-blue-600' : 'bg-indigo-600')}>
                <AvatarFallback className="text-white text-sm font-medium">
                    {isUser ? 'U' : 'AI'}
                </AvatarFallback>
            </Avatar>
            <div className={cn('flex-1 space-y-2 overflow-hidden', isUser ? 'flex flex-col items-end' : 'flex flex-col items-start')}>
                <div className={cn('flex items-center gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
                    <span className="text-sm font-semibold">
                        {isUser ? 'You' : 'DCKTRP AI'}
                    </span>
                    {message.created_at && !isStreaming && (
                        <span className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                    )}
                </div>

                {/* File attachments display */}
                {attachments.length > 0 && (
                    <div className={cn('flex flex-wrap gap-2', isUser ? 'justify-end' : 'justify-start')}>
                        {attachments.map((attachment, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm max-w-[280px]',
                                    isUser
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                                )}
                            >
                                {attachment.type === 'image' ? (
                                    <ImageIcon className="h-4 w-4 flex-shrink-0" />
                                ) : (
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="truncate font-medium">{attachment.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Message content */}
                {cleanContent && (
                    <div
                        className={cn(
                            'px-4 py-2.5 rounded-2xl max-w-[85%]',
                            isUser
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                        )}
                    >
                        <div
                            className={cn(
                                'prose prose-sm max-w-none',
                                isUser
                                    ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white'
                                    : 'dark:prose-invert'
                            )}
                        >
                            {isUser ? (
                                <p className="whitespace-pre-wrap m-0">{cleanContent}</p>
                            ) : (
                                <ReactMarkdown>{cleanContent}</ReactMarkdown>
                            )}
                            {isStreaming && (
                                <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
