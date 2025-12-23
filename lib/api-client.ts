import axios from 'axios';
import { storage } from './utils/storage';

// Use relative URLs - they will be proxied to the backend via Next.js rewrites
const API_BASE_URL = '';

// Get the API key from environment variable (required for SSO authentication)
const API_KEY = process.env.NEXT_PUBLIC_RAGSYSTEM_API_KEY || '';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add SSO user_id and API key
apiClient.interceptors.request.use(
    (config) => {
        // Get user_id from storage (set by SSO or manually)
        const userId = storage.getUserId();
        
        const debugInfo = {
            timestamp: new Date().toISOString(),
            url: config.url,
            method: config.method,
            userId: userId || 'NOT SET',
            apiKey: API_KEY ? `SET (length: ${API_KEY.length})` : 'NOT SET',
            hasUserId: !!userId,
            hasApiKey: !!API_KEY,
        };
        
        // Save debug info to localStorage for inspection
        localStorage.setItem('DEBUG_LAST_API_REQUEST', JSON.stringify(debugInfo));
        
        console.log('🔐 API Request Interceptor:', debugInfo);
        
        if (!userId) {
            const error = '❌ API request made without user_id - request will fail!';
            console.error(error);
            localStorage.setItem('DEBUG_ERROR', error);
        } else {
            config.headers['X-User-ID'] = userId;
            console.log('✅ Added X-User-ID header:', userId);
        }
        
        // Add API key for SSO authentication
        if (API_KEY) {
            config.headers['X-API-Key'] = API_KEY;
            console.log('✅ Added X-API-Key header');
        } else {
            const error = '❌ NEXT_PUBLIC_RAGSYSTEM_API_KEY not configured - API requests will fail!';
            console.error(error);
            localStorage.setItem('DEBUG_ERROR', error);
        }
        
        const finalHeaders = {
            'X-User-ID': config.headers['X-User-ID'] || 'NOT SET',
            'X-API-Key': config.headers['X-API-Key'] ? '***' + config.headers['X-API-Key'].slice(-4) : 'NOT SET'
        };
        
        localStorage.setItem('DEBUG_LAST_HEADERS', JSON.stringify(finalHeaders));
        console.log('📤 Final headers:', finalHeaders);
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Unauthorized/Forbidden - clear storage and redirect to login
            storage.clear();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
