import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        const authHeader = request.headers.get('authorization');
        const search = request.nextUrl.search;

        const response = await fetch(`${backendUrl}/conversations/${search}`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader || '',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Get conversations proxy error:', error);
        return NextResponse.json(
            { detail: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        const authHeader = request.headers.get('authorization');
        const body = await request.text();

        const response = await fetch(`${backendUrl}/conversations/`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
            body,
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Create conversation proxy error:', error);
        return NextResponse.json(
            { detail: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
