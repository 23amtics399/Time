/**
 * Curated IANA timezone list with display labels and UTC offsets.
 * Offsets are approximate (non-DST); actual offset is computed via Intl.
 */

export const TIMEZONES = [
  // Americas
  { value: 'Pacific/Honolulu',       label: 'Honolulu (HST)',            region: 'Americas' },
  { value: 'America/Anchorage',      label: 'Anchorage (AKST)',          region: 'Americas' },
  { value: 'America/Los_Angeles',    label: 'Los Angeles (PST/PDT)',      region: 'Americas' },
  { value: 'America/Denver',         label: 'Denver (MST/MDT)',           region: 'Americas' },
  { value: 'America/Chicago',        label: 'Chicago (CST/CDT)',          region: 'Americas' },
  { value: 'America/New_York',       label: 'New York (EST/EDT)',         region: 'Americas' },
  { value: 'America/Halifax',        label: 'Halifax (AST/ADT)',          region: 'Americas' },
  { value: 'America/St_Johns',       label: 'St. John\'s (NST/NDT)',     region: 'Americas' },
  { value: 'America/Sao_Paulo',      label: 'São Paulo (BRT)',            region: 'Americas' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'Americas' },
  { value: 'America/Toronto',        label: 'Toronto (EST/EDT)',          region: 'Americas' },
  { value: 'America/Vancouver',      label: 'Vancouver (PST/PDT)',        region: 'Americas' },
  { value: 'America/Mexico_City',    label: 'Mexico City (CST/CDT)',      region: 'Americas' },
  { value: 'America/Bogota',         label: 'Bogotá (COT)',               region: 'Americas' },
  { value: 'America/Lima',           label: 'Lima (PET)',                 region: 'Americas' },
  { value: 'America/Santiago',       label: 'Santiago (CLT)',             region: 'Americas' },
  { value: 'America/Caracas',        label: 'Caracas (VET)',              region: 'Americas' },

  // Europe
  { value: 'Atlantic/Reykjavik',     label: 'Reykjavik (GMT)',            region: 'Europe' },
  { value: 'Europe/Lisbon',          label: 'Lisbon (WET/WEST)',          region: 'Europe' },
  { value: 'Europe/London',          label: 'London (GMT/BST)',           region: 'Europe' },
  { value: 'Europe/Dublin',          label: 'Dublin (GMT/IST)',           region: 'Europe' },
  { value: 'Europe/Paris',           label: 'Paris (CET/CEST)',           region: 'Europe' },
  { value: 'Europe/Berlin',          label: 'Berlin (CET/CEST)',          region: 'Europe' },
  { value: 'Europe/Rome',            label: 'Rome (CET/CEST)',            region: 'Europe' },
  { value: 'Europe/Madrid',          label: 'Madrid (CET/CEST)',          region: 'Europe' },
  { value: 'Europe/Amsterdam',       label: 'Amsterdam (CET/CEST)',       region: 'Europe' },
  { value: 'Europe/Brussels',        label: 'Brussels (CET/CEST)',        region: 'Europe' },
  { value: 'Europe/Zurich',          label: 'Zurich (CET/CEST)',          region: 'Europe' },
  { value: 'Europe/Stockholm',       label: 'Stockholm (CET/CEST)',       region: 'Europe' },
  { value: 'Europe/Helsinki',        label: 'Helsinki (EET/EEST)',        region: 'Europe' },
  { value: 'Europe/Warsaw',          label: 'Warsaw (CET/CEST)',          region: 'Europe' },
  { value: 'Europe/Kiev',            label: 'Kyiv (EET/EEST)',            region: 'Europe' },
  { value: 'Europe/Athens',          label: 'Athens (EET/EEST)',          region: 'Europe' },
  { value: 'Europe/Bucharest',       label: 'Bucharest (EET/EEST)',       region: 'Europe' },
  { value: 'Europe/Moscow',          label: 'Moscow (MSK)',               region: 'Europe' },
  { value: 'Europe/Istanbul',        label: 'Istanbul (TRT)',             region: 'Europe' },
  { value: 'Europe/Copenhagen',      label: 'Copenhagen (CET/CEST)',      region: 'Europe' },
  { value: 'Europe/Oslo',            label: 'Oslo (CET/CEST)',            region: 'Europe' },

  // Africa
  { value: 'Africa/Cairo',           label: 'Cairo (EET)',                region: 'Africa' },
  { value: 'Africa/Nairobi',         label: 'Nairobi (EAT)',              region: 'Africa' },
  { value: 'Africa/Lagos',           label: 'Lagos (WAT)',                region: 'Africa' },
  { value: 'Africa/Johannesburg',    label: 'Johannesburg (SAST)',        region: 'Africa' },
  { value: 'Africa/Casablanca',      label: 'Casablanca (WET)',           region: 'Africa' },
  { value: 'Africa/Accra',           label: 'Accra (GMT)',                region: 'Africa' },

  // Asia
  { value: 'Asia/Dubai',             label: 'Dubai (GST)',                region: 'Asia' },
  { value: 'Asia/Kolkata',           label: 'Mumbai / Delhi (IST)',       region: 'Asia' },
  { value: 'Asia/Kathmandu',         label: 'Kathmandu (NPT)',            region: 'Asia' },
  { value: 'Asia/Dhaka',             label: 'Dhaka (BST)',                region: 'Asia' },
  { value: 'Asia/Colombo',           label: 'Colombo (SLST)',             region: 'Asia' },
  { value: 'Asia/Karachi',           label: 'Karachi (PKT)',              region: 'Asia' },
  { value: 'Asia/Kabul',             label: 'Kabul (AFT)',                region: 'Asia' },
  { value: 'Asia/Tehran',            label: 'Tehran (IRST)',              region: 'Asia' },
  { value: 'Asia/Riyadh',            label: 'Riyadh (AST)',               region: 'Asia' },
  { value: 'Asia/Jerusalem',         label: 'Jerusalem (IST)',            region: 'Asia' },
  { value: 'Asia/Baghdad',           label: 'Baghdad (AST)',              region: 'Asia' },
  { value: 'Asia/Tashkent',          label: 'Tashkent (UZT)',             region: 'Asia' },
  { value: 'Asia/Almaty',            label: 'Almaty (ALMT)',              region: 'Asia' },
  { value: 'Asia/Bangkok',           label: 'Bangkok (ICT)',              region: 'Asia' },
  { value: 'Asia/Ho_Chi_Minh',       label: 'Ho Chi Minh City (ICT)',     region: 'Asia' },
  { value: 'Asia/Jakarta',           label: 'Jakarta (WIB)',              region: 'Asia' },
  { value: 'Asia/Kuala_Lumpur',      label: 'Kuala Lumpur (MYT)',         region: 'Asia' },
  { value: 'Asia/Singapore',         label: 'Singapore (SGT)',            region: 'Asia' },
  { value: 'Asia/Manila',            label: 'Manila (PHT)',               region: 'Asia' },
  { value: 'Asia/Shanghai',          label: 'Beijing / Shanghai (CST)',   region: 'Asia' },
  { value: 'Asia/Hong_Kong',         label: 'Hong Kong (HKT)',            region: 'Asia' },
  { value: 'Asia/Taipei',            label: 'Taipei (CST)',               region: 'Asia' },
  { value: 'Asia/Seoul',             label: 'Seoul (KST)',                region: 'Asia' },
  { value: 'Asia/Tokyo',             label: 'Tokyo (JST)',                region: 'Asia' },

  // Pacific
  { value: 'Australia/Perth',        label: 'Perth (AWST)',               region: 'Pacific' },
  { value: 'Australia/Darwin',       label: 'Darwin (ACST)',              region: 'Pacific' },
  { value: 'Australia/Adelaide',     label: 'Adelaide (ACST/ACDT)',       region: 'Pacific' },
  { value: 'Australia/Sydney',       label: 'Sydney (AEST/AEDT)',         region: 'Pacific' },
  { value: 'Australia/Melbourne',    label: 'Melbourne (AEST/AEDT)',      region: 'Pacific' },
  { value: 'Australia/Brisbane',     label: 'Brisbane (AEST)',            region: 'Pacific' },
  { value: 'Pacific/Auckland',       label: 'Auckland (NZST/NZDT)',       region: 'Pacific' },
  { value: 'Pacific/Fiji',           label: 'Fiji (FJT)',                 region: 'Pacific' },
  { value: 'Pacific/Guam',           label: 'Guam (ChST)',                region: 'Pacific' },
  { value: 'UTC',                    label: 'UTC (Coordinated Universal Time)', region: 'UTC' },
];

/** Get the current UTC offset string for a timezone, e.g. "UTC+5:30" */
export function getUTCOffset(timezone) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart ? offsetPart.value : '';
  } catch {
    return '';
  }
}

/** Format a Date in a given timezone */
export function formatInZone(date, timezone, options = {}) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      ...options,
    }).format(date);
  } catch {
    return '';
  }
}

/** Get grouped timezones for UI rendering */
export function getTimezonesByRegion() {
  const regions = {};
  for (const tz of TIMEZONES) {
    if (!regions[tz.region]) regions[tz.region] = [];
    regions[tz.region].push(tz);
  }
  return regions;
}
