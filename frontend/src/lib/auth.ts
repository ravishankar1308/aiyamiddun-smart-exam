// frontend/src/lib/auth.ts

const TOKEN_KEY = 'jwt_token';

/**
 * Saves the authentication token to localStorage.
 * @param token The token string to save.
 */
export const saveToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string or null if it doesn't exist.
 */
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

/**
 * Checks if a user is currently authenticated.
 * @returns True if a token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};
