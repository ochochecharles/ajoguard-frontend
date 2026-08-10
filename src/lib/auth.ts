import { browser } from '$app/environment';

/**
 * Manages the logged-in collector's state in sessionStorage.
 *
 * sessionStorage is scoped to the individual tab, so each tab keeps its own
 * independent session — you can be logged in as different accounts in
 * different tabs. A closed tab discards its session.
 *
 * Three pieces are stored:
 *   - access token  (short-lived JWT, ~8h)
 *   - refresh token (rotated on every refresh, ~30d)
 *   - collector     (the user profile returned by the backend)
 *
 * Components can subscribe to auth changes via `onAuthChange` so the
 * dashboard/router react to logout / token refreshes without reloads.
 */

export interface Collector {
  id:      string;
  name:    string;
  email:   string;
  groupId: string;
  role:    string;
  joinCode?: string | null;
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    string;
  collector:    Collector;
}

const ACCESS_KEY   = 'ajoguard_access_token';
const REFRESH_KEY  = 'ajoguard_refresh_token';
const COLLECTOR_KEY = 'ajoguard_collector';

type Listener = () => void;

const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((l) => l());
}

/**
 * Subscribe to auth changes (login, logout, token rotation).
 * Returns an unsubscribe function.
 */
export function onAuthChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Persist a full AuthResponse from the backend after login/registration/refresh.
 */
export function saveAuth(auth: AuthResponse): void {
  if (!browser) return;
  sessionStorage.setItem(ACCESS_KEY, auth.accessToken);
  sessionStorage.setItem(REFRESH_KEY, auth.refreshToken);
  sessionStorage.setItem(COLLECTOR_KEY, JSON.stringify(auth.collector));
  notify();
}

/**
 * Store a fresh token pair after a silent refresh.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (!browser) return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  sessionStorage.setItem(REFRESH_KEY, refreshToken);
  notify();
}

export function getToken(): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!browser) return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function getCollector(): Collector | null {
  if (!browser) return null;
  const raw = sessionStorage.getItem(COLLECTOR_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Collector;
  } catch {
    // Corrupted stored data — treat as logged out
    return null;
  }
}

/** True when both an access token and collector profile exist. */
export function isAuthenticated(): boolean {
  if (!browser) return false;
  return !!getToken() && !!getCollector();
}

/**
 * Clear all auth data. Called on logout or when the refresh token dies.
 */
export function clearAuth(): void {
  if (!browser) return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(COLLECTOR_KEY);
  notify();
}