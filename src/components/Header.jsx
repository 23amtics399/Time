import { Link } from 'react-router-dom';
import './Header.css';

export default function Header({ sidebarOpen, onToggleSidebar, theme, onToggleTheme }) {
  return (
    <header className="header" role="banner">
      {/* Left: hamburger + logo */}
      <div className="header-left">
        <button
          className="btn btn-ghost btn-icon header-hamburger"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
        >
          <HamburgerIcon open={sidebarOpen} />
        </button>

        <Link to="/" className="header-logo" aria-label="Time Tools home">
          <LogoIcon />
          <span className="header-logo-text">
            Time<span className="header-logo-dot">.</span>
          </span>
        </Link>
      </div>

      {/* Right: theme toggle */}
      <div className="header-right">
        <button
          className="btn btn-ghost btn-icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

function LogoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open ? (
        // X icon
        <>
          <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </>
      ) : (
        // Hamburger
        <>
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M15.5 11.5A6.5 6.5 0 0 1 8.5 4.5a6.5 6.5 0 0 0 7 11 6.5 6.5 0 0 1-7-4z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
