/**
 * Shared time utility functions.
 * Pure functions — no side effects, no external dependencies.
 */

/** Zero-pad a number to `width` digits */
export function pad(n, width = 2) {
  return String(Math.floor(n)).padStart(width, '0');
}

/** Format milliseconds → { h, m, s, ms } object */
export function msToComponents(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h  = Math.floor(totalSeconds / 3600);
  const m  = Math.floor((totalSeconds % 3600) / 60);
  const s  = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return { h, m, s, centis, totalSeconds };
}

/** Format milliseconds → "HH:MM:SS" or "HH:MM:SS.cc" */
export function formatDuration(ms, showCentis = false) {
  const { h, m, s, centis } = msToComponents(ms);
  const base = h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
  return showCentis ? `${base}.${pad(centis)}` : base;
}

/** Format total seconds → human readable "Xh Ym Zs" */
export function formatDurationHuman(totalSeconds) {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return (totalSeconds < 0 ? '-' : '') + parts.join(' ');
}

/** Parse "HH:MM:SS" or "MM:SS" string → total seconds */
export function parseDurationString(str) {
  const parts = str.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

/**
 * Get difference between two Dates → { days, hours, minutes, seconds,
 * totalSeconds, totalMinutes, totalHours, totalDays, sign }
 */
export function dateDiff(from, to) {
  const sign = to >= from ? 1 : -1;
  const diffMs = Math.abs(to - from);
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours   = Math.floor(diffMs / 3600000);
  const totalDays    = Math.floor(diffMs / 86400000);

  const days    = Math.floor(diffMs / 86400000);
  const hours   = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { days, hours, minutes, seconds, totalSeconds, totalMinutes, totalHours, totalDays, sign };
}

/** Format a Date as "YYYY-MM-DDTHH:MM" for datetime-local inputs */
export function toDatetimeLocal(date) {
  const y  = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d  = pad(date.getDate());
  const h  = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

/** Format a Date as "YYYY-MM-DD" for date inputs */
export function toDateInput(date) {
  const y  = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d  = pad(date.getDate());
  return `${y}-${mo}-${d}`;
}

/** Format a Date as "HH:MM" for time inputs */
export function toTimeInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert a Unix timestamp (seconds) → Date */
export function fromUnix(ts) {
  return new Date(ts * 1000);
}

/** Convert a Date → Unix timestamp (seconds) */
export function toUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

/** Format a Date to display string with options */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/** Get the ordinal suffix for a number (1st, 2nd, 3rd, etc.) */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Add duration to a Date. unit: 'years'|'months'|'days'|'hours'|'minutes'|'seconds' */
export function addDuration(date, amount, unit) {
  const d = new Date(date);
  switch (unit) {
    case 'years':   d.setFullYear(d.getFullYear() + amount); break;
    case 'months':  d.setMonth(d.getMonth() + amount); break;
    case 'days':    d.setDate(d.getDate() + amount); break;
    case 'hours':   d.setHours(d.getHours() + amount); break;
    case 'minutes': d.setMinutes(d.getMinutes() + amount); break;
    case 'seconds': d.setSeconds(d.getSeconds() + amount); break;
  }
  return d;
}

/** Check if a value is a valid finite number */
export function isValidNumber(v) {
  return v !== '' && v !== null && v !== undefined && isFinite(Number(v));
}

/** Clamp a value between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
