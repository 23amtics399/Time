import { NavLink } from 'react-router-dom';
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
  DateCountdownIcon,
  MeetingIcon,
  TimeUnitIcon,
  MilitaryTimeIcon,
  WorkingHoursIcon,
  TimeFormatsIcon,
  DstCheckerIcon,
  SleepTimeIcon,
  WeekNumberIcon,
} from './icons';
import './Sidebar.css';

const TOOLS = [
  {
    category: 'Live Clocks',
    icon: '🕐',
    items: [
      { path: '/clock',       label: 'Digital Clock',  icon: DigitalClockIcon },
      { path: '/analog',      label: 'Analog Clock',   icon: AnalogClockIcon },
      { path: '/world-clock', label: 'World Clock',    icon: WorldClockIcon },
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
      { path: '/unix',                     label: 'Unix Timestamp',     icon: UnixIcon },
      { path: '/timezone',                 label: 'Timezone Converter', icon: TimezoneIcon },
      { path: '/time-diff',                label: 'Time Difference',    icon: TimeDiffIcon },
      { path: '/add-subtract',             label: 'Add / Subtract',     icon: AddSubtractIcon },
      { path: '/time-converter',           label: 'Time Unit Converter', icon: TimeUnitIcon },
      { path: '/military-time-converter',  label: 'Military Time',      icon: MilitaryTimeIcon },
      { path: '/time-formats',             label: 'Time Formats',       icon: TimeFormatsIcon },
    ],
  },
  {
    category: 'Planning',
    icon: '📅',
    items: [
      { path: '/date-countdown', label: 'Date Countdown',   icon: DateCountdownIcon },
      { path: '/meeting',        label: 'Meeting Planner',  icon: MeetingIcon },
      { path: '/working-hours',  label: 'Working Hours',    icon: WorkingHoursIcon },
      { path: '/dst-checker',    label: 'DST Checker',      icon: DstCheckerIcon },
      { path: '/sleep-time',     label: 'Sleep Time',       icon: SleepTimeIcon },
      { path: '/week-number',    label: 'Week Number',      icon: WeekNumberIcon },
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

export { TOOLS };
