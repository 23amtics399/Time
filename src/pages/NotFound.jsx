import { Link } from 'react-router-dom';
import { DigitalClockIcon, WorldClockIcon, StopwatchIcon, CountdownIcon, PomodoroIcon, TimezoneIcon } from '../components/icons';
import './NotFound.css';

const POPULAR_TOOLS = [
  { path: '/clock', name: 'Digital Clock', desc: 'Fullscreen live time display', icon: DigitalClockIcon },
  { path: '/world-clock', name: 'World Clock', desc: 'Compare global cities side by side', icon: WorldClockIcon },
  { path: '/stopwatch', name: 'Stopwatch', desc: 'Millisecond laps & split statistics', icon: StopwatchIcon },
  { path: '/countdown', name: 'Countdown Timer', desc: 'Custom intervals & audio alerts', icon: CountdownIcon },
  { path: '/pomodoro', name: 'Pomodoro Timer', desc: '25/5 focus & productivity sessions', icon: PomodoroIcon },
  { path: '/timezone', name: 'Timezone Converter', desc: 'Convert time across worldwide zones', icon: TimezoneIcon },
];

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card card">
        <div className="not-found-badge badge badge-amber">Error 404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-lead">
          The temporal coordinates you requested do not exist or have moved. Let&apos;s get you back on schedule.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Back to Time Tools Home
          </Link>
          <Link to="/about" className="btn btn-ghost">
            About Time Tools
          </Link>
        </div>

        <div className="not-found-suggestions">
          <h2 className="not-found-subtitle">Popular Time Utilities</h2>
          <div className="not-found-grid">
            {POPULAR_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path} to={tool.path} className="not-found-tool-card">
                  <div className="not-found-tool-icon" aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div className="not-found-tool-text">
                    <span className="not-found-tool-name">{tool.name}</span>
                    <span className="not-found-tool-desc">{tool.desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
