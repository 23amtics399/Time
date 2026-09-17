import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import { ToastProvider } from '../contexts/ToastContext';
import { useTheme } from '../hooks/useTheme';
import { useRecentTools } from '../hooks/useRecentTools';
import './Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();
  const { recordVisit } = useRecentTools();

  // Scroll to top on every route change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Record tool visit for recent tools
  useEffect(() => {
    recordVisit(location.pathname);
  }, [location.pathname, recordVisit]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut: Ctrl+K / Cmd+K to toggle Search, Escape to close
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        else if (sidebarOpen) setSidebarOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);
  const openSearch    = useCallback(() => setSearchOpen(true), []);
  const closeSearch   = useCallback(() => setSearchOpen(false), []);

  return (
    <ToastProvider>
      <div className="app-shell">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSearch={openSearch}
        />

        <Sidebar
          open={sidebarOpen}
          onClose={closeSidebar}
        />

        <main
          className="app-main"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        <SearchModal
          open={searchOpen}
          onClose={closeSearch}
        />
      </div>
    </ToastProvider>
  );
}
