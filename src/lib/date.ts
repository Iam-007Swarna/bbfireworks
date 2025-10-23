/**
 * Centralized date/time utilities with IST (Indian Standard Time) support
 * All dates in the app should use these utilities for consistency
 */

// Indian Standard Time timezone
export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date as a full date-time string in IST
 * Example: "23/10/2025, 7:49:42 pm"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format a date as date only in IST
 * Example: "23/10/2025"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Format a date as date with long month in IST
 * Example: "23 October 2025"
 */
export function formatDateLong(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format time only in IST
 * Example: "7:49:42 pm"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format time without seconds in IST
 * Example: "7:49 pm"
 */
export function formatTimeShort(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Format a relative time (e.g., "2 hours ago", "just now")
 * Uses IST as reference
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;

  // Get current time in IST
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

  // For older dates, just show the date
  return formatDate(d);
}

/**
 * Format date and time separately for displays
 * Returns: { date: "23/10/2025", time: "7:49 pm" }
 */
export function formatDateTimeSplit(date: Date | string | null | undefined): { date: string; time: string } {
  if (!date) return { date: '—', time: '—' };

  return {
    date: formatDate(date),
    time: formatTimeShort(date),
  };
}

/**
 * Get current date/time in IST
 */
export function nowIST(): Date {
  return new Date();
}

/**
 * Format for PDF invoices (clean, professional format)
 * Example: "23 Oct 2025"
 */
export function formatDateForPDF(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}
