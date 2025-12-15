import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization');

        // Forward to backend
        const response = await fetch(`${backendUrl}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader || '',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Users/me proxy error:', error);
        return NextResponse.json(
            { detail: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
