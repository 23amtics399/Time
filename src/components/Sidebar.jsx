import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const TOOLS = [
  {
    category: 'Live Clocks',
    icon: '🕐',
    items: [
      { path: '/clock',       label: 'Digital Clock',  icon: ClockIcon },
      { path: '/analog',      label: 'Analog Clock',   icon: DialIcon },
      { path: '/world-clock', label: 'World Clock',    icon: GlobeIcon },
    ],
  },
  {
    category: 'Timers',
    icon: '⏱',
    items: [
      { path: '/stopwatch', label: 'Stopwatch',         icon: StopwatchIcon },
      { path: '/countdown', label: 'Countdown Timer',   icon: CountdownIcon },
      { path: '/pomodoro',  label: 'Pomodoro Timer',    icon: PomodoroIcon },
      { path: '/alarm',     label: 'Alarm',             icon: AlarmIcon },
    ],
  },
  {
    category: 'Converters',
    icon: '🔄',
    items: [
      { path: '/unix',                     label: 'Unix Timestamp',     icon: HashIcon },
      { path: '/timezone',                 label: 'Timezone Converter', icon: ZoneIcon },
      { path: '/time-diff',                label: 'Time Difference',    icon: DiffIcon },
      { path: '/add-subtract',             label: 'Add / Subtract',     icon: MathIcon },
      { path: '/time-converter',           label: 'Time Unit Converter', icon: UnitIcon },
      { path: '/military-time-converter',  label: 'Military Time',      icon: MilitaryIcon },
      { path: '/time-formats',             label: 'Time Formats',       icon: FormatIcon },
    ],
  },
  {
    category: 'Planning',
    icon: '📅',
    items: [
      { path: '/date-countdown', label: 'Date Countdown',   icon: EventIcon },
      { path: '/meeting',        label: 'Meeting Planner',  icon: MeetingIcon },
      { path: '/working-hours',  label: 'Working Hours',    icon: BriefcaseIcon },
      { path: '/dst-checker',    label: 'DST Checker',      icon: SunMoonIcon },
      { path: '/sleep-time',     label: 'Sleep Time',       icon: BedIcon },
      { path: '/week-number',    label: 'Week Number',      icon: CalendarNumberIcon },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}

      <nav
        className={`sidebar ${open ? 'sidebar--open' : ''}`}
        aria-label="Tool navigation"
      >
        <div className="sidebar-inner">
          {TOOLS.map(group => (
            <div key={group.category} className="sidebar-group">
              <p className="sidebar-group-label">{group.category}</p>
              <ul>
                {group.items.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                      }
                      onClick={onClose}
                    >
                      <span className="sidebar-link-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="text-faint text-xs">time.sji.one</p>
        </div>
      </nav>
    </>
  );
}

/* ── Inline SVG icons ── */
function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function DialIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="1.2" fill="currentColor"/>
      <path d="M10 10 L7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 10 L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2.5c0 0-3 3-3 7.5s3 7.5 3 7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2.5c0 0 3 3 3 7.5s-3 7.5-3 7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 10h15" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function StopwatchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 4.5V2.5M8 2.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 11V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CountdownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6v4l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13.5 4.5l1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function PomodoroIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5C7 2.5 5 5 5 8c0 3.5 3.5 7 5 9 1.5-2 5-5.5 5-9 0-3-2-5.5-5-5.5z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function AlarmIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 10.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 10.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.5 4.5l-2 2M17.5 4.5l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function HashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 8h12M4 12h12M8 4l-1.5 12M13.5 4L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ZoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2.5 10h15M10 2.5c-2 2.5-2 12.5 0 15" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M15 6.5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DiffIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12" y="4" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function MathIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10h10M10 5v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function EventIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 12h2l1 2 1-4 1 2h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MeetingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="14" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 17c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 12c2 0 4 1.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function UnitIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 6h12M13 3l3 3-3 3M16 14H4M7 11l-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MilitaryIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 10h1.5M10 10h.01M12.5 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 7l-3 3 3 3M14 7l3 3-3 3M11 5l-2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="14" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 6.5V4.5a1 1 0 011-1h4a1 1 0 011 1v2M3 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SunMoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.5 1.5M14 14l1.5 1.5M4.5 15.5l1.5-1.5M14 6l1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 7v10M3 12h14v5M17 9v8M6 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CalendarNumberIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 12h4M10 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export { TOOLS };
