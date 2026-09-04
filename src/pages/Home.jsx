import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './Home.css';

const TOOL_GROUPS = [
  {
    category: 'Live Clocks',
    description: 'Real-time clocks in multiple formats',
    tools: [
      {
        path: '/clock',
        name: 'Digital Clock',
        description: 'Full-screen 12/24-hour clock with date and timezone.',
        icon: ClockIcon,
        accent: 'violet',
      },
      {
        path: '/analog',
        name: 'Analog Clock',
        description: 'Smooth-sweep analog clock with a clean face.',
        icon: DialIcon,
        accent: 'violet',
      },
      {
        path: '/world-clock',
        name: 'World Clock',
        description: 'Live time in multiple timezones, side by side.',
        icon: GlobeIcon,
        accent: 'violet',
      },
    ],
  },
  {
    category: 'Timers',
    description: 'Measure and track time',
    tools: [
      {
        path: '/stopwatch',
        name: 'Stopwatch',
        description: 'Precise stopwatch with lap times and copy-to-clipboard.',
        icon: StopwatchIcon,
        accent: 'green',
      },
      {
        path: '/countdown',
        name: 'Countdown Timer',
        description: 'Set a timer with presets or a custom duration. Audio alert.',
        icon: CountdownIcon,
        accent: 'green',
      },
      {
        path: '/pomodoro',
        name: 'Pomodoro Timer',
        description: '25/5/15 work–break cycles. Fully customizable.',
        icon: PomodoroIcon,
        accent: 'green',
      },
      {
        path: '/alarm',
        name: 'Alarm',
        description: 'Set one or more alarms with a desktop notification.',
        icon: AlarmIcon,
        accent: 'green',
      },
    ],
  },
  {
    category: 'Converters',
    description: 'Convert and calculate time values',
    tools: [
      {
        path: '/unix',
        name: 'Unix Timestamp',
        description: 'Convert between Unix epoch and human-readable dates.',
        icon: HashIcon,
        accent: 'amber',
      },
      {
        path: '/timezone',
        name: 'Timezone Converter',
        description: 'Convert a date and time between any two timezones.',
        icon: ZoneIcon,
        accent: 'amber',
      },
      {
        path: '/time-diff',
        name: 'Time Difference',
        description: 'Calculate the exact difference between two timestamps.',
        icon: DiffIcon,
        accent: 'amber',
      },
      {
        path: '/add-subtract',
        name: 'Add / Subtract Time',
        description: 'Add or subtract a duration from any date and time.',
        icon: MathIcon,
        accent: 'amber',
      },
    ],
  },
  {
    category: 'Planning',
    description: 'Plan across time and timezones',
    tools: [
      {
        path: '/date-countdown',
        name: 'Date Countdown',
        description: 'Countdown to any future date — events, deadlines, holidays.',
        icon: EventIcon,
        accent: 'blue',
      },
      {
        path: '/meeting',
        name: 'Meeting Planner',
        description: 'Find the best meeting time across multiple timezones.',
        icon: MeetingIcon,
        accent: 'blue',
      },
    ],
  },
];

const ACCENT_VARS = {
  violet: 'var(--accent)',
  green:  'var(--success)',
  amber:  'var(--warning)',
  blue:   'hsl(210, 90%, 60%)',
};

export default function Home() {
  return (
    <>
      <SEO
        title="Free Online Time Utilities"
        description="Free, fast, and beautifully designed time tools — digital clocks, stopwatch, countdown timers, Pomodoro, timezone converter, Unix timestamp, and more. No sign-up required."
        path="/"
      />

      <div className="home-page">
        {/* Hero */}
        <section className="home-hero animate-fade-in" aria-label="Introduction">
          <div className="home-hero-icon" aria-hidden="true">
            <HeroClockIcon />
          </div>
          <h1 className="home-title">Time Tools</h1>
          <p className="home-subtitle">
            A fast, focused collection of browser-based time utilities.
            No sign-up. No ads. Works offline.
          </p>
        </section>

        {/* Tool Grid */}
        <div className="home-groups">
          {TOOL_GROUPS.map((group, gi) => (
            <section key={group.category} className="home-group animate-fade-in" style={{ animationDelay: `${gi * 80}ms` }}>
              <div className="home-group-header">
                <h2 className="home-group-title">{group.category}</h2>
                <p className="home-group-desc text-muted text-sm">{group.description}</p>
              </div>

              <div className="home-grid">
                {group.tools.map(tool => {
                  const Icon = tool.icon;
                  const color = ACCENT_VARS[tool.accent] || ACCENT_VARS.violet;
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="tool-card"
                      style={{ '--card-accent': color }}
                      aria-label={`${tool.name} — ${tool.description}`}
                    >
                      <div className="tool-card-icon" aria-hidden="true">
                        <Icon />
                      </div>
                      <div className="tool-card-body">
                        <h3 className="tool-card-name">{tool.name}</h3>
                        <p className="tool-card-desc">{tool.description}</p>
                      </div>
                      <span className="tool-card-arrow" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Icons ── */
function HeroClockIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle cx="28" cy="28" r="24" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="2"/>
      <path d="M28 16v12l8 8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="28" cy="28" r="2.5" fill="var(--accent)"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <path d="M12 12 L9 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 12 L15.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c0 0-3.5 3.5-3.5 9s3.5 9 3.5 9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 3c0 0 3.5 3.5 3.5 9s-3.5 9-3.5 9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}
function StopwatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13.5" r="8" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 5V3M10 3h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 13.5V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function CountdownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7.5v4.5l-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function PomodoroIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 8.5V13l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 4.5c0 0 1-2 3-2s3 2 3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function AlarmIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 10v3l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 5.5l-2 2M20.5 5.5l-2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9h16M4 15h16M9.5 4l-2 16M16.5 4l-2 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function ZoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 12h18M12 3c-2.5 3-2.5 15 0 18" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M17 8l2.5 2.5L17 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DiffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="5" width="7" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14.5" y="5" width="7" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9.5 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function MathIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 15l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function MeetingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 20c0-3.5 2.5-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M17 14c2.5 0 5 1.5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
