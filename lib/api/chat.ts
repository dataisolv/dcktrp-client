import { QueryRequest, StreamChunk } from '@/types';
import { storage } from '../utils/storage';

export const chatApi = {
    async streamQuery(
        request: QueryRequest,
        onChunk: (chunk: StreamChunk) => void,
        onError: (error: string) => void,
        onComplete: () => void
    ): Promise<void> {
        const token = storage.getToken();

        try {
            // Get user_id from storage for SSO authentication
            const userId = storage.getUserId();
            const apiKey = process.env.NEXT_PUBLIC_RAGSYSTEM_API_KEY || '';
            
            const response = await fetch('/query/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(userId ? { 'X-User-ID': userId } : {}),
                    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
                },
                body: JSON.stringify({
                    ...request,
                    stream: true,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Response body is null');
            }

            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const chunk: StreamChunk = JSON.parse(line);
                            onChunk(chunk);

                            if (chunk.error) {
                                onError(chunk.error);
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing chunk:', e);
                        }
                    }
                }
            }

            onComplete();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            onError(errorMessage);
        }
    },
};
