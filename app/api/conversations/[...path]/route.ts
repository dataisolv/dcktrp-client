import { NextRequest, NextResponse } from 'next/server';

// Proxy all conversation requests to backend
export async function GET(request: NextRequest) {
    return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, 'POST');
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request, 'DELETE');
}

async function proxyRequest(request: NextRequest, method: string) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    try {
        const authHeader = request.headers.get('authorization');
        const path = request.nextUrl.pathname.replace('/api', '');
        const search = request.nextUrl.search;

        const headers: HeadersInit = {
            'Authorization': authHeader || '',
        };

        let body = undefined;
        if (method !== 'GET' && method !== 'DELETE') {
            const contentType = request.headers.get('content-type');
            if (contentType) {
                headers['Content-Type'] = contentType;
            }
            body = await request.text();
        }

        const response = await fetch(`${backendUrl}${path}${search}`, {
            method,
            headers,
            body,
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { detail: 'Request failed' },
            { status: 500 }
        );
    }
}
