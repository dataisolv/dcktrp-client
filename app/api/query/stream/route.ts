import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.text();

        // Forward to backend
        const response = await fetch(`${backendUrl}/query/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || '',
            },
            body: body,
        });

        // Return the streaming response as-is
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Query stream proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Stream failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
