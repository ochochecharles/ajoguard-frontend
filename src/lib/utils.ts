/**
 * Convert kobo to formatted naira string
 * Backend stores amounts in kobo (₦1 = 100 kobo)
 * Example: naira(500000) → "₦5,000"
 */
export function naira(kobo: number): string {
  return '₦' + (kobo / 100).toLocaleString('en-NG');
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
 * Shorten a UUID to first 8 characters in uppercase
 * Used for displaying event IDs and references
 * Example: shortId("550e8400-e29b-41d4...") → "550E8400"
 */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Extract initials from a full name
 * Used for avatar circles
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