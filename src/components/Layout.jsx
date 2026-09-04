import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../hooks/useTheme';
import './Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen(o => !o), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-shell">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        theme={theme}
        onToggleTheme={toggleTheme}
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
    </div>
  );
}
