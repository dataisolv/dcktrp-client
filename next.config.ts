import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Read from .env file - during dev, this reads from .env
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8012';

    console.log('📡 Next.js Rewrites - Backend URL:', backendUrl);

    const rewrites = [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/login',
        destination: `${backendUrl}/login`,
      },
      {
        source: '/auth-status',
        destination: `${backendUrl}/auth-status`,
      },
      {
        source: '/users/:path*',
        destination: `${backendUrl}/users/:path*`,
      },
      {
        source: '/conversations/:path*',
        destination: `${backendUrl}/conversations/:path*`,
      },
      {
        source: '/query/:path*',
        destination: `${backendUrl}/query/:path*`,
      },
      {
        source: '/documents/:path*',
        destination: `${backendUrl}/documents/:path*`,
      },
      {
        source: '/graphs/:path*',
        destination: `${backendUrl}/graphs/:path*`,
      },
    ];

    console.log('📡 Configured rewrites:', rewrites.length, 'rules');
    return rewrites;
  },
};

export default nextConfig;
