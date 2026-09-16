import { Link } from 'react-router-dom';
import { LogoIcon, HamburgerIcon, SunIcon, MoonIcon } from './icons';
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

