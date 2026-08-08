import { env } from '$env/dynamic/public';

/**
 * Runtime config loaded from PUBLIC_* environment variables.
 *
 * PUBLIC_API_BASE_URL      — the AjoGuard backend origin (no trailing slash)
 * PUBLIC_GOOGLE_CLIENT_ID  — optional; when set, the login page can skip the
 *                            browser redirect and use the ID-token flow
 *                            (POST /auth/google/login) instead.
 */
export const API_BASE_URL: string = deriveUrl(
  env.PUBLIC_API_BASE_URL ?? 'https://ajoguard.onrender.com',
);

export const GOOGLE_CLIENT_ID: string = env.PUBLIC_GOOGLE_CLIENT_ID ?? '';

function deriveUrl(value: string): string {
  return value.replace(/\/+$/, '');
}