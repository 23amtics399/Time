import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { TOOL_GROUPS } from '../data/tools';
import './About.css';

export default function About() {
  return (
    <>
      <SEO path="/about" />

      <div className="about-page">
        <header className="about-header">
          <span className="about-kicker badge badge-violet">About Time Tools</span>
          <h1 className="about-title">About Time Tools</h1>
          <p className="about-lead">
            A fast, private, and beautifully crafted suite of 20 temporal utilities built for everyday work, focus, and cross-timezone collaboration.
          </p>
        </header>

        <section className="about-section card">
          <h2>What is Time Tools?</h2>
          <p>
            Time Tools (<strong>time.sji.one</strong>) is a collection of browser-based utilities dedicated strictly to clocks, countdowns, temporal calculations, timestamps, and global scheduling. Whether you need an accurate full-screen digital clock for your desk, a millisecond-precision stopwatch with lap exports, a Pomodoro focus interval timer, or a visual international meeting planner, Time Tools delivers an instant, ad-free experience.
          </p>
        </section>

        <section className="about-section card">
          <h2>Client-First Architecture &amp; Privacy</h2>
          <p>
            Every tool on Time Tools runs entirely in your browser. We adhere to a strict client-side model:
          </p>
          <ul className="about-list">
            <li><strong>Zero Tracking &amp; No Ads:</strong> We do not track your usage, sell your data, or serve invasive advertisements.</li>
            <li><strong>Local State Persistence:</strong> Your timer settings, custom countdown presets, alarms, favorite timezones, and theme preferences are saved securely in your browser&apos;s <code>localStorage</code>.</li>
            <li><strong>No Backend Dependency:</strong> Clocks, epoch converters, DST explorers, and formatters execute natively with JavaScript and browser temporal APIs.</li>
            <li><strong>Fast &amp; Static:</strong> Pages are statically generated for instant loading, full crawlability, and zero runtime overhead.</li>
          </ul>
        </section>

        <section className="about-section card">
          <h2>Explore the 20 Tools</h2>
          <p>
            Our tools are categorized into four specialized groups to help you find exactly what you need:
          </p>
          <div className="about-groups-grid">
            {TOOL_GROUPS.map((group) => (
              <div key={group.category} className="about-group-card">
                <div className="about-group-header">
                  <span className="about-group-icon" aria-hidden="true">{group.icon}</span>
                  <h3>{group.category}</h3>
                </div>
                <p className="about-group-desc">{group.description}</p>
                <ul className="about-tool-links">
                  {group.tools.map((t) => (
                    <li key={t.path}>
                      <Link to={t.path} className="about-tool-link">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section card">
          <h2>Part of the SJI Network</h2>
          <p>
            Time Tools is built and maintained as part of the <a href="https://sji.one/" target="_blank" rel="noopener noreferrer">SJI network</a> of focused, lightweight web products designed for everyday productivity:
          </p>
          <div className="about-network-grid">
            <a href="https://sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>SJI Home</strong>
              <span>Web products and utilities ecosystem</span>
            </a>
            <a href="https://calc.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>Calculators</strong>
              <span>Mathematical, financial, and unit calculators</span>
            </a>
            <a href="https://tools.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>Online Tools</strong>
              <span>Browser-based image and PDF utilities</span>
            </a>
            <a href="https://tempbox.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>TempBox</strong>
              <span>Disposable temporary email addresses</span>
            </a>
            <a href="https://shorty.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>Shorty</strong>
              <span>Fast, clean URL shortener</span>
            </a>
            <a href="https://scratchpad.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>Scratchpad</strong>
              <span>Local-first writing and note-taking workspace</span>
            </a>
            <a href="https://prebase.sji.one/" className="about-network-card" target="_blank" rel="noopener noreferrer">
              <strong>PreBase</strong>
              <span>AI chatbots grounded in your custom content</span>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
