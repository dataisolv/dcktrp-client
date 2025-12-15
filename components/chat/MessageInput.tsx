'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-white dark:bg-slate-950 p-4">
            <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={disabled}
                    className="flex-1 h-12 text-base"
                    autoFocus
                />
                <Button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
