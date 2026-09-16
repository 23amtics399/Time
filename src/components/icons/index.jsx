/**
 * Unified, accessible SVG icon system for Time Tools.
 * All icons share a 24x24 viewBox, inherit currentColor, and support custom className/size.
 */

export function DigitalClockIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="7" y1="10" x2="7" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10.5" cy="10" r="0.75" fill="currentColor"/>
      <circle cx="10.5" cy="14" r="0.75" fill="currentColor"/>
      <path d="M14 10h3v4h-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

export function AnalogClockIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="12" y1="5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="17.5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="5" y1="12" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="17.5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="12 7.5 12 12 15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}

export function WorldClockIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2.5a14 14 0 0 0-4 9.5 14 14 0 0 0 4 9.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2.5a14 14 0 0 1 4 9.5 14 14 0 0 1-4 9.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.8"/>
      <polyline points="12 8 12 12 14.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function StopwatchIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="13.5" r="7.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="12" y1="6" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9.5" y1="3" x2="14.5" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="17.5" y1="7.5" x2="19.5" y2="5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <polyline points="12 13.5 12 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="13.5" r="1" fill="currentColor"/>
    </svg>
  );
}

export function CountdownIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 3.5l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 3"/>
    </svg>
  );
}

export function PomodoroIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M12 4.5c-4.5 0-8 3-8 7.5 0 4.8 4 8.5 8 8.5s8-3.7 8-8.5c0-4.5-3.5-7.5-8-7.5z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 3.5c1-1 3-1 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="12" x2="14.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function AlarmIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8"/>
      <polyline points="12 9 12 13 14.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 3.5L2 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19 3.5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="6.5" y1="20" x2="5" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="17.5" y1="20" x2="19" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function UnixIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="10" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="4" x2="14" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function TimezoneIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 6.5l2 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function TimeDiffIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="7" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
      <polyline points="7 10 7 12 8.5 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 10 17 12 18.5 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 8.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10.5 15.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function AddSubtractIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="18" cy="6" r="3.5" fill="var(--bg-card, #131224)" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="16.5" y1="6" x2="19.5" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function DateCountdownIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="8" y1="3" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="3" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 15h2l1 2 1.5-4 1 2h2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MeetingIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="16" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2.5 19c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 13.5c2.3 0 4.5 1.7 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function TimeUnitIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M4 7h12M13 4l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 17H8M11 14l-3 3 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

export function MilitaryTimeIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M6.5 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="10.5" r="0.75" fill="currentColor"/>
      <circle cx="12" cy="13.5" r="0.75" fill="currentColor"/>
      <path d="M15.5 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function WorkingHoursIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="3" y="7.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8.5 7.5V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="3" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  );
}

export function TimeFormatsIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <polyline points="7 8 3 12 7 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 21 12 17 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="14" y1="5" x2="10" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function DstCheckerIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v2.5M12 19.5V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M2 12h2.5M19.5 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function SleepTimeIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 4h3l-3 4h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function WeekNumberIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="8" y1="3" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="16" y1="3" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" fontFamily="monospace">#W</text>
    </svg>
  );
}

// --- Common UI Icons ---

export function CopyIcon({ size = 16, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CheckIcon({ size = 16, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SunIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function MoonIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function LogoIcon({ size = 24, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7v5l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function HamburgerIcon({ open, size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      )}
    </svg>
  );
}

export function FullscreenIcon({ size = 18, isFullscreen = false, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      {isFullscreen ? (
        <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14L3 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );
}

export function SoundIcon({ size = 18, muted = false, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      {muted ? (
        <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}
