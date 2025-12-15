const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const storage = {
    getToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
    },

    getUser: (): any | null => {
        if (typeof window === 'undefined') return null;
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    setUser: (user: any): void => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    removeUser: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(USER_KEY);
    },

    clear: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};
