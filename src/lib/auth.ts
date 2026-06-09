import { browser } from '$app/environment';
/**
 * This file manages the logged-in collector's state.
 * If you ever switch from localStorage to cookies or a different storage mechanism, you only change this file.
 */

// The shape of a collector object returned by the backend
export interface Collector {
  id:          string;
  name:        string;
  email:       string;
  groupId:     string;
  role:        string;
}

/**
 * Save the access token and collector info after successful login.
 * Called by the login page after verify-otp succeeds.
 */
export function saveAuth(token: string, collector: Collector): void {
    if (!browser) return; // Ensure this code only runs in the browser
    localStorage.setItem('ajoguard_token', token);
    localStorage.setItem('ajoguard_collector', JSON.stringify(collector));
}

/**
 * Get the stored JWT token.
 * Returns null if not logged in.
 */
export function getToken(): string | null {
    if (!browser) return null;
    return localStorage.getItem('ajoguard_token');
}

/**
 * Get the stored collector object.
 * Returns null if not logged in.
 */
export function getCollector(): Collector | null {
    if (!browser) return null;
    const raw = localStorage.getItem('ajoguard_collector');
    if (!raw) return null;

    try {
        return JSON.parse(raw) as Collector;
    } catch {
        // If stored data is corrupted, treat as logged out
        return null;
    }
}

/**
 * Check if a collector is currently logged in.
 * True if both token and collector exist in localStorage.
 */
export function isAuthenticated(): boolean {
    if (!browser) return false;
    return !!getToken() && !!getCollector();
}

/**
 * Clear all auth data from localStorage.
 * Called on logout or when a 401 response is received.
 */
export function clearAuth(): void {
    if (!browser) return;
    localStorage.removeItem('ajoguard_token');
    localStorage.removeItem('ajoguard_collector');
}