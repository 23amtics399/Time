import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { TOOL_GROUPS, getToolByPath } from '../data/tools';
import { useFavorites } from '../hooks/useFavorites';
import { useRecentTools } from '../hooks/useRecentTools';
import { StarIcon } from '../components/icons';
import './Home.css';

const ACCENT_VARS = {
  violet: 'var(--accent)',
  green:  'var(--green)',
  amber:  'var(--amber)',
  blue:   'var(--blue)',
};

export default function Home() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { recentTools } = useRecentTools();

  const favoriteTools = favorites
    .map(path => getToolByPath(path))
    .filter(Boolean);

  const recentToolItems = recentTools
    .map(path => getToolByPath(path))
    .filter(Boolean);

  const renderToolCard = (tool) => {
    const Icon = tool.icon;
    const color = ACCENT_VARS[tool.accent] || ACCENT_VARS.violet;
    const favorited = isFavorite(tool.path);

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
        <div className="tool-card-actions">
          <button
            type="button"
            className={`tool-card-fav ${favorited ? 'tool-card-fav--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(tool.path);
            }}
            aria-label={favorited ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <StarIcon filled={favorited} />
          </button>
          <span className="tool-card-arrow" aria-hidden="true">→</span>
        </div>
      </Link>
    );
  };

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

        {/* Tool Groups */}
        <div className="home-groups">
          {/* Favorites Section (if any) */}
          {favoriteTools.length > 0 && (
            <section className="home-group animate-fade-in" aria-label="Favorite tools">
              <div className="home-group-header">
                <h2 className="home-group-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StarIcon filled style={{ width: 18, height: 18, color: 'var(--amber)' }} />
                  Favorites
                </h2>
                <p className="home-group-desc text-muted text-sm">Your pinned utilities for instant access</p>
              </div>
              <div className="home-grid">
                {favoriteTools.map(renderToolCard)}
              </div>
            </section>
          )}

          {/* Recently Visited Section (if any) */}
          {recentToolItems.length > 0 && (
            <section className="home-group animate-fade-in" aria-label="Recently used tools">
              <div className="home-group-header">
                <h2 className="home-group-title">Recently Used</h2>
                <p className="home-group-desc text-muted text-sm">Tools you recently visited</p>
              </div>
              <div className="home-grid">
                {recentToolItems.map(renderToolCard)}
              </div>
            </section>
          )}

          {/* Categorized Tools */}
          {TOOL_GROUPS.map((group, gi) => (
            <section key={group.category} className="home-group animate-fade-in" style={{ animationDelay: `${gi * 80}ms` }}>
              <div className="home-group-header">
                <h2 className="home-group-title">{group.category}</h2>
                <p className="home-group-desc text-muted text-sm">{group.description}</p>
              </div>

              <div className="home-grid">
                {group.tools.map(renderToolCard)}
              </div>
            </section>
          ))}
        </div>

        {/* Informative Crawlable Overview */}
        <section className="home-about card" aria-label="About Time Tools">
          <h2 className="home-about-heading">Browser-Based Time Utilities Built for Speed &amp; Precision</h2>
          <p className="home-about-text text-muted">
            Time Tools brings together essential timing, conversion, and scheduling utilities into a single lightweight web application. Whether you need a distraction-free digital clock for your desk, a millisecond stopwatch for athletic training, an interval Pomodoro timer for deep work sessions, or an international meeting planner for remote teams, every utility runs entirely within your browser with zero latency.
          </p>

          <div className="home-about-grid">
            <div className="home-about-card">
              <h3 className="home-card-title">Privacy &amp; Local-First</h3>
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
              <h3 className="home-card-title">Daylight Saving &amp; IANA Accuracy</h3>
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
