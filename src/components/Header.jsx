import { Link } from 'react-router-dom';
import { LogoIcon, HamburgerIcon, SunIcon, MoonIcon, SearchIcon } from './icons';
import './Header.css';

export default function Header({ sidebarOpen, onToggleSidebar, theme, onToggleTheme, onOpenSearch }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

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

      {/* Center: Search input button */}
      <div className="header-search-wrap">
        <button
          type="button"
          className="header-search-btn"
          onClick={onOpenSearch}
          aria-label="Search tools (Ctrl+K)"
          title="Search tools (Ctrl+K)"
        >
          <SearchIcon />
          <span className="header-search-placeholder">Search tools...</span>
          <kbd className="header-search-kbd">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
      </div>

      {/* Right: mobile search button & theme toggle */}
      <div className="header-right">
        <button
          type="button"
          className="btn btn-ghost btn-icon header-search-mobile"
          onClick={onOpenSearch}
          aria-label="Search tools"
          title="Search tools"
        >
          <SearchIcon />
        </button>

        <button
          type="button"
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
