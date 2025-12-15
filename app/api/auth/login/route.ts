import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        // Get the form data from the request
        const body = await request.text();

        // Forward to backend
        const response = await fetch(`${backendUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Login proxy error:', error);
        return NextResponse.json(
            { detail: 'Login failed' },
            { status: 500 }
        );
    }
}
