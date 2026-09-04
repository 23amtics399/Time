import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * useTheme — manages dark/light theme with localStorage persistence.
 * Returns [theme, toggleTheme].
 * Applies 'data-theme' attribute to <html> element.
 */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Update theme-color meta for mobile browser chrome
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach(meta => {
      const media = meta.getAttribute('media') || '';
      if (media.includes('dark')) {
        meta.setAttribute('content', theme === 'dark' ? '#09090f' : '#f5f5fa');
      } else if (media.includes('light')) {
        meta.setAttribute('content', theme === 'light' ? '#f5f5fa' : '#09090f');
      }
    });
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }

  return [theme, toggleTheme];
}
