import { env } from '$env/dynamic/public';

/**
 * Runtime config loaded from PUBLIC_* environment variables.
 *
 * PUBLIC_API_BASE_URL      — the AjoGuard backend origin (no trailing slash)
 * PUBLIC_GOOGLE_CLIENT_ID  — optional; when set, the login page can skip the
 *                            browser redirect and use the ID-token flow
 *                            (POST /auth/google/login) instead.
 * PUBLIC_TELEGRAM_BOT_HANDLE — username of the group's Telegram bot used for
 *                            contribution ingestion and member notifications
 *                            (with or without the leading "@"). Empty means
 *                            the channel is not configured yet.
 */
export const API_BASE_URL: string = deriveUrl(
  env.PUBLIC_API_BASE_URL ?? 'https://ajoguard.onrender.com',
);

export const GOOGLE_CLIENT_ID: string = env.PUBLIC_GOOGLE_CLIENT_ID ?? '';

/**
 * Telegram bot handle, normalised to have no leading '@'.
 * Empty when PUBLIC_TELEGRAM_BOT_HANDLE is unset.
 */
export const TELEGRAM_BOT_HANDLE: string = (env.PUBLIC_TELEGRAM_BOT_HANDLE ?? '')
  .trim()
  .replace(/^@/, '');

/** Display label, e.g. "@AjoGuardBot" — empty when not configured. */
export const TELEGRAM_BOT_LABEL: string = TELEGRAM_BOT_HANDLE
  ? `@${TELEGRAM_BOT_HANDLE}`
  : '';

/** Deep link that opens the bot in Telegram. Empty when not configured. */
export const TELEGRAM_START_URL: string = TELEGRAM_BOT_HANDLE
  ? `https://t.me/${TELEGRAM_BOT_HANDLE}`
  : '';

function deriveUrl(value: string): string {
  return value.replace(/\/+$/, '');
}