/**
 * Money is formatted from integer Naira values returned by the API.
 * The backend also exposes a raw `...InKobo` field on every money field —
 * keep any arithmetic in kobo integers (`toKobo`/`fromKobo`) to avoid float drift.
 */

/**
 * Format an integer Naira amount as a ₦ string.
 * Example: naira(5000) → "₦5,000"
 */
export function naira(value: number): string {
  return '₦' + Math.round(value).toLocaleString('en-NG');
}

/**
 * Convert a kobo amount (raw from the API) into a formatted naira string.
 * Example: nairaFromKobo(500000) → "₦5,000"
 */
export function nairaFromKobo(koboValue: number): string {
  return naira(koboValue / 100);
}

/** Naira integer → kobo integer (x100). */
export function toKobo(nairaValue: number): number {
  return Math.round(nairaValue * 100);
}

/** Kobo integer → naira number (÷100). */
export function fromKobo(koboValue: number): number {
  return koboValue / 100;
}

/**
 * Format a date into readable Nigerian format
 * Example: fmtDate("2026-05-14") → "14 May 2026"
 */
export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-NG', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/**
 * Format a date with time
 * Example: fmtDateTime("2026-05-14T10:30") → "14 May 2026, 10:30"
 */
export function fmtDateTime(d: string | Date): string {
  return new Date(d).toLocaleString('en-NG', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/**
 * Shorten a UUID to first 8 characters in uppercase
 * Example: shortId("550e8400-e29b-41d4...") → "550E8400"
 */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Extract initials from a full name
 * Example: initials("Mama Ngozi") → "MN"
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalise the first letter of a string
 * Example: capitalize("weekly") → "Weekly"
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}