import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX_RECENT = 6;

export function useRecentTools() {
  const [recentTools, setRecentTools] = useLocalStorage('time-tools-recent', []);

  const recordVisit = useCallback((path) => {
    if (!path || path === '/' || path === '') return;
    setRecentTools(prev => {
      const current = Array.isArray(prev) ? prev : [];
      // If already first, do not re-set
      if (current[0] === path) return current;
      const filtered = current.filter(p => p !== path);
      return [path, ...filtered].slice(0, MAX_RECENT);
    });
  }, [setRecentTools]);

  const clearRecent = useCallback(() => {
    setRecentTools([]);
  }, [setRecentTools]);

  return {
    recentTools: Array.isArray(recentTools) ? recentTools : [],
    recordVisit,
    clearRecent,
  };
}
