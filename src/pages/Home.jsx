import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  DigitalClockIcon,
  AnalogClockIcon,
  WorldClockIcon,
  StopwatchIcon,
  CountdownIcon,
  PomodoroIcon,
  AlarmIcon,
  UnixIcon,
  TimezoneIcon,
  TimeDiffIcon,
  AddSubtractIcon,
  TimeUnitIcon,
  MilitaryTimeIcon,
  TimeFormatsIcon,
  DateCountdownIcon,
  MeetingIcon,
  WorkingHoursIcon,
  DstCheckerIcon,
  SleepTimeIcon,
  WeekNumberIcon,
} from '../components/icons';
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
        icon: DigitalClockIcon,
        accent: 'violet',
      },
      {
        path: '/analog',
        name: 'Analog Clock',
        description: 'Smooth-sweep analog clock with a clean face.',
        icon: AnalogClockIcon,
        accent: 'violet',
      },
      {
        path: '/world-clock',
        name: 'World Clock',
        description: 'Live time in multiple timezones, side by side.',
        icon: WorldClockIcon,
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
        icon: UnixIcon,
        accent: 'amber',
      },
      {
        path: '/timezone',
        name: 'Timezone Converter',
        description: 'Convert a date and time between any two timezones.',
        icon: TimezoneIcon,
        accent: 'amber',
      },
      {
        path: '/time-diff',
        name: 'Time Difference',
        description: 'Calculate the exact difference between two timestamps.',
        icon: TimeDiffIcon,
        accent: 'amber',
      },
      {
        path: '/add-subtract',
        name: 'Add / Subtract Time',
        description: 'Add or subtract a duration from any date and time.',
        icon: AddSubtractIcon,
        accent: 'amber',
      },
      {
        path: '/time-converter',
        name: 'Time Unit Converter',
        description: 'Convert between weeks, days, hours, minutes, seconds, and ms.',
        icon: TimeUnitIcon,
        accent: 'amber',
      },
      {
        path: '/military-time-converter',
        name: 'Military Time Converter',
        description: 'Convert between 12-hour AM/PM and 24-hour military notation.',
        icon: MilitaryTimeIcon,
        accent: 'amber',
      },
      {
        path: '/time-formats',
        name: 'Time Formats',
        description: 'Format and parse ISO 8601, RFC 2822, and Unix timestamps.',
        icon: TimeFormatsIcon,
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
        icon: DateCountdownIcon,
        accent: 'blue',
      },
      {
        path: '/meeting',
        name: 'Meeting Planner',
        description: 'Find the best meeting time across multiple timezones.',
        icon: MeetingIcon,
        accent: 'blue',
      },
      {
        path: '/working-hours',
        name: 'Working Hours',
        description: 'Calculate net business hours and working days excluding weekends.',
        icon: WorkingHoursIcon,
        accent: 'blue',
      },
      {
        path: '/dst-checker',
        name: 'DST Checker',
        description: 'Inspect Daylight Saving Time schedules, transitions, and offsets.',
        icon: DstCheckerIcon,
        accent: 'blue',
      },
      {
        path: '/sleep-time',
        name: 'Sleep Time Planner',
        description: 'Plan sleep and wake schedules aligned with 90-minute sleep cycles.',
        icon: SleepTimeIcon,
        accent: 'blue',
      },
      {
        path: '/week-number',
        name: 'Week Number',
        description: 'Current ISO 8601 week number, day of year, and annual progress.',
        icon: WeekNumberIcon,
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
      <SEO path="/" />

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

        {/* Informative Crawlable Overview */}
        <section className="home-about card" aria-label="About Time Tools">
          <h2 className="home-about-heading">Browser-Based Time Utilities Built for Speed & Precision</h2>
          <p className="home-about-text text-muted">
            Time Tools brings together essential timing, conversion, and scheduling utilities into a single lightweight web application. Whether you need a distraction-free digital clock for your desk, a millisecond stopwatch for athletic training, an interval Pomodoro timer for deep work sessions, or an international meeting planner for remote teams, every utility runs entirely within your browser with zero latency.
          </p>

          <div className="home-about-grid">
            <div className="home-about-card">
              <h3 className="home-card-title">Privacy & Local-First</h3>
              <p className="home-card-text text-muted text-sm">
                All time calculations, alarm schedules, and stopwatch splits are computed directly on your device. We do not track your activity, record your time entries, or require account creation.
              </p>
            </div>
            <div className="home-about-card">
              <h3 className="home-card-title">Full Offline Capability</h3>
              <p className="home-card-text text-muted text-sm">
                Once loaded, Time Tools operates seamlessly without an active internet connection. Synthesized audio alarms, canvas graphics, and timezone calculations are executed client-side.
              </p>
            </div>
            <div className="home-about-card">
              <h3 className="home-card-title">Daylight Saving & IANA Accuracy</h3>
              <p className="home-card-text text-muted text-sm">
                International clocks and timezone converters leverage standard IANA timezone databases built into modern browsers, guaranteeing accurate local offsets and seasonal DST transitions.
              </p>
            </div>
          </div>

          <div className="home-faqs">
            <h3 className="home-faqs-title">Frequently Asked Questions</h3>
            <details className="faq-item" open>
              <summary className="faq-question">
                <span>Are all utilities on Time Tools free to use?</span>
                <span className="faq-chevron" aria-hidden="true">▾</span>
              </summary>
              <div className="faq-answer text-muted text-sm">
                <p>Yes. Every clock, stopwatch, countdown timer, converter, and planner is completely free, ad-free, and unrestricted for personal, commercial, and educational use.</p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">
                <span>Do timers and stopwatches continue running if I switch tabs?</span>
                <span className="faq-chevron" aria-hidden="true">▾</span>
              </summary>
              <div className="faq-answer text-muted text-sm">
                <p>Yes. Active timers, stopwatches, and Pomodoro sessions store absolute target timestamps in browser storage, ensuring elapsed and remaining time remain strictly accurate regardless of tab backgrounding.</p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-question">
                <span>How do I synchronize my preferred timezone across clocks?</span>
                <span className="faq-chevron" aria-hidden="true">▾</span>
              </summary>
              <div className="faq-answer text-muted text-sm">
                <p>On the Digital Clock page, choose your target timezone and check the "Use this timezone across Time" option. The Analog Clock and system displays will instantly synchronize to that timezone.</p>
              </div>
            </details>
          </div>
        </section>
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


