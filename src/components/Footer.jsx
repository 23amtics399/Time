import { Link } from 'react-router-dom';
import './Footer.css';

const SJI_NETWORK = [
  { name: 'SJI Home', url: 'https://sji.one/', desc: 'Web products for everyday work' },
  { name: 'Calculators', url: 'https://calc.sji.one/', desc: 'Free online calculators' },
  { name: 'Online Tools', url: 'https://tools.sji.one/', desc: 'Image and PDF utility suite' },
  { name: 'TempBox', url: 'https://tempbox.sji.one/', desc: 'Free temporary disposable email' },
  { name: 'Shorty', url: 'https://shorty.sji.one/', desc: 'Fast, privacy-friendly URL shortener' },
  { name: 'Scratchpad', url: 'https://scratchpad.sji.one/', desc: 'Local-first distraction-free writing' },
  { name: 'PreBase', url: 'https://prebase.sji.one/', desc: 'AI chatbots grounded in your docs' },
];

const POPULAR_TOOLS = [
  { name: 'Digital Clock', path: '/clock' },
  { name: 'World Clock', path: '/world-clock' },
  { name: 'Stopwatch', path: '/stopwatch' },
  { name: 'Countdown Timer', path: '/countdown' },
  { name: 'Pomodoro Timer', path: '/pomodoro' },
  { name: 'Alarm', path: '/alarm' },
  { name: 'Timezone Converter', path: '/timezone' },
  { name: 'Meeting Planner', path: '/meeting' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-brand" aria-label="Time Tools Home">
              <span className="footer-brand-icon" aria-hidden="true">⏱</span>
              <span className="footer-brand-name">Time Tools</span>
            </Link>
            <p className="footer-desc">
              Free, fast, and beautifully designed browser-based time utilities. Live clocks, precision stopwatch, countdown intervals, Pomodoro focus, timezone conversion, and global meeting planning.
            </p>
            <div className="footer-privacy-pill">
              <span className="footer-privacy-dot" aria-hidden="true" />
              <span>100% Client-Side • Zero Tracking • No Ads</span>
            </div>
          </div>

          {/* Core Tools Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">Popular Tools</h3>
            <ul className="footer-nav-list">
              {POPULAR_TOOLS.map((tool) => (
                <li key={tool.path}>
                  <Link to={tool.path} className="footer-nav-link">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Time Navigation & About */}
          <div className="footer-col">
            <h3 className="footer-col-title">Navigation</h3>
            <ul className="footer-nav-list">
              <li>
                <Link to="/" className="footer-nav-link">All 20 Tools</Link>
              </li>
              <li>
                <Link to="/about" className="footer-nav-link">About Time Tools</Link>
              </li>
              <li>
                <Link to="/working-hours" className="footer-nav-link">Working Hours</Link>
              </li>
              <li>
                <Link to="/dst-checker" className="footer-nav-link">DST Explorer</Link>
              </li>
              <li>
                <Link to="/time-formats" className="footer-nav-link">Time Formats</Link>
              </li>
              <li>
                <Link to="/sleep-time" className="footer-nav-link">Sleep Planner</Link>
              </li>
              <li>
                <Link to="/week-number" className="footer-nav-link">Week Number</Link>
              </li>
            </ul>
          </div>

          {/* SJI Network Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">SJI Network</h3>
            <ul className="footer-nav-list">
              {SJI_NETWORK.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    className="footer-nav-link footer-external-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{item.name}</span>
                    <span className="footer-ext-icon" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {currentYear} <a href="https://sji.one/" target="_blank" rel="noopener noreferrer">SJI</a>. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/about" className="footer-bottom-link">About</Link>
            <span className="footer-sep" aria-hidden="true">•</span>
            <a href="https://sji.one/" className="footer-bottom-link" target="_blank" rel="noopener noreferrer">sji.one</a>
            <span className="footer-sep" aria-hidden="true">•</span>
            <span className="footer-meta">Free &amp; Open Web Utilities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
