import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_FAVORITES = ['/clock', '/stopwatch', '/countdown', '/pomodoro'];

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage('time-tools-favorites', DEFAULT_FAVORITES);

  const isFavorite = useCallback((path) => {
    return Array.isArray(favorites) && favorites.includes(path);
  }, [favorites]);

  const toggleFavorite = useCallback((path) => {
    if (!path) return;
    setFavorites(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(path)) {
        return arr.filter(p => p !== path);
      } else {
        return [...arr, path];
      }
    });
  }, [setFavorites]);

  const addFavorite = useCallback((path) => {
    if (!path) return;
    setFavorites(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (!arr.includes(path)) return [...arr, path];
      return arr;
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((path) => {
    if (!path) return;
    setFavorites(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.filter(p => p !== path);
    });
  }, [setFavorites]);

  return {
    favorites: Array.isArray(favorites) ? favorites : [],
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };
}
