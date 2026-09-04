import { useState, useEffect } from 'react';

/**
 * useLocalStorage — persisted useState backed by localStorage.
 * @param {string} key - localStorage key
 * @param {*} defaultValue - initial value if no stored value exists
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [key, value]);

  return [value, setValue];
}
