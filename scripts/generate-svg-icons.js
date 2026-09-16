import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

export const TOOL_ICONS_SVG = {
  'clock.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2" y="5" width="20" height="14" rx="3"/>
  <line x1="7" y1="10" x2="7" y2="14"/>
  <line x1="10.5" y1="10" x2="10.5" y2="10.01"/>
  <line x1="10.5" y1="14" x2="10.5" y2="14.01"/>
  <path d="M14 10h3v4h-3z"/>
</svg>`,

  'analog-clock.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9.5"/>
  <line x1="12" y1="5.5" x2="12" y2="7"/>
  <line x1="12" y1="17" x2="12" y2="18.5"/>
  <line x1="5.5" y1="12" x2="7" y2="12"/>
  <line x1="17" y1="12" x2="18.5" y2="12"/>
  <polyline points="12 7.5 12 12 15 14"/>
  <circle cx="12" cy="12" r="1" fill="currentColor"/>
</svg>`,

  'world-clock.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9.5"/>
  <path d="M12 2.5a14 14 0 0 0-4 9.5 14 14 0 0 0 4 9.5"/>
  <path d="M12 2.5a14 14 0 0 1 4 9.5 14 14 0 0 1-4 9.5"/>
  <line x1="2.5" y1="12" x2="21.5" y2="12"/>
  <polyline points="12 8 12 12 14.5 13.5"/>
</svg>`,

  'stopwatch.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="13.5" r="7.5"/>
  <line x1="12" y1="6" x2="12" y2="3"/>
  <line x1="9.5" y1="3" x2="14.5" y2="3"/>
  <line x1="17.5" y1="7.5" x2="19.5" y2="5.5"/>
  <polyline points="12 13.5 12 9.5"/>
  <circle cx="12" cy="13.5" r="1" fill="currentColor"/>
</svg>`,

  'countdown.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 7v5l3.5 2"/>
  <path d="M16 3.5l2 2" stroke-width="1.5"/>
  <path d="M4 12a8 8 0 0 1 8-8" stroke-dasharray="2 3"/>
</svg>`,

  'pomodoro.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 4.5c-4.5 0-8 3-8 7.5 0 4.8 4 8.5 8 8.5s8-3.7 8-8.5c0-4.5-3.5-7.5-8-7.5z"/>
  <path d="M12 2v2.5"/>
  <path d="M10 3.5c1-1 3-1 4 0"/>
  <line x1="12" y1="8.5" x2="12" y2="12"/>
  <line x1="12" y1="12" x2="14.5" y2="12"/>
</svg>`,

  'alarm.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="13" r="8"/>
  <polyline points="12 9 12 13 14.5 15"/>
  <path d="M5 3.5L2 6.5"/>
  <path d="M19 3.5l3 3"/>
  <line x1="6.5" y1="20" x2="5" y2="22"/>
  <line x1="17.5" y1="20" x2="19" y2="22"/>
</svg>`,

  'unix.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <line x1="4" y1="9" x2="20" y2="9"/>
  <line x1="4" y1="15" x2="20" y2="15"/>
  <line x1="10" y1="4" x2="8" y2="20"/>
  <line x1="16" y1="4" x2="14" y2="20"/>
</svg>`,

  'timezone.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <line x1="3" y1="12" x2="21" y2="12"/>
  <path d="M12 3c-2.5 3-2.5 15 0 18"/>
  <path d="M16 6.5l2 2-2 2"/>
</svg>`,

  'time-diff.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="7" cy="12" r="5"/>
  <circle cx="17" cy="12" r="5"/>
  <polyline points="7 10 7 12 8.5 13"/>
  <polyline points="17 10 17 12 18.5 13"/>
  <path d="M10.5 8.5l3 0"/>
  <path d="M10.5 15.5l3 0"/>
</svg>`,

  'add-subtract.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/>
  <line x1="7" y1="12" x2="17" y2="12"/>
  <line x1="12" y1="7" x2="12" y2="17"/>
  <circle cx="18" cy="6" r="3.5" fill="#09090f" stroke="currentColor" stroke-width="1.5"/>
  <line x1="16.5" y1="6" x2="19.5" y2="6"/>
</svg>`,

  'date-countdown.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="5" width="18" height="15" rx="2.5"/>
  <line x1="3" y1="10" x2="21" y2="10"/>
  <line x1="8" y1="3" x2="8" y2="6"/>
  <line x1="16" y1="3" x2="16" y2="6"/>
  <path d="M8 15h2l1 2 1.5-4 1 2h2.5"/>
</svg>`,

  'meeting.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="8" cy="8" r="3.5"/>
  <circle cx="16" cy="8.5" r="3"/>
  <path d="M2.5 19c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5"/>
  <path d="M16 13.5c2.3 0 4.5 1.7 4.5 4.5"/>
</svg>`,

  'time-converter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 7h12M13 4l3 3-3 3"/>
  <path d="M20 17H8M11 14l-3 3 3 3"/>
  <circle cx="12" cy="12" r="2"/>
</svg>`,

  'military-time.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="2.5" y="6" width="19" height="12" rx="2.5"/>
  <path d="M6.5 12h2"/>
  <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
  <circle cx="12" cy="14" r="0.5" fill="currentColor"/>
  <path d="M15.5 12h2"/>
</svg>`,

  'working-hours.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="7.5" width="18" height="13" rx="2"/>
  <path d="M8 7.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.5"/>
  <line x1="3" y1="13" x2="21" y2="13"/>
  <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
</svg>`,

  'time-formats.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="7 8 3 12 7 16"/>
  <polyline points="17 8 21 12 17 16"/>
  <line x1="14" y1="5" x2="10" y2="19"/>
</svg>`,

  'dst-checker.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <path d="M12 2v2.5M12 19.5V22"/>
  <path d="M2 12h2.5M19.5 12H22"/>
  <path d="M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8"/>
  <path d="M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>
</svg>`,

  'sleep-time.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
  <path d="M17 4h3l-3 4h3" stroke-width="1.5"/>
</svg>`,

  'week-number.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="5" width="18" height="15" rx="2.5"/>
  <line x1="3" y1="10" x2="21" y2="10"/>
  <line x1="8" y1="3" x2="8" y2="6"/>
  <line x1="16" y1="3" x2="16" y2="6"/>
  <text x="12" y="17" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" stroke="none" font-family="monospace">#W</text>
</svg>`,
};

for (const [filename, svg] of Object.entries(TOOL_ICONS_SVG)) {
  fs.writeFileSync(path.join(iconsDir, filename), svg, 'utf8');
}

console.log(`✅ Generated ${Object.keys(TOOL_ICONS_SVG).length} SVG icons in public/icons/`);
