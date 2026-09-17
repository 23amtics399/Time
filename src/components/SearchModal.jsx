import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_TOOLS } from '../data/tools';
import { SearchIcon, StarIcon, CloseIcon } from './icons';
import { useFavorites } from '../hooks/useFavorites';
import './SearchModal.css';

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Reset and focus when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return ALL_TOOLS;
    }
    return ALL_TOOLS.filter(tool => {
      if (tool.name?.toLowerCase().includes(q)) return true;
      if (tool.category?.toLowerCase().includes(q)) return true;
      if (tool.description?.toLowerCase().includes(q)) return true;
      if (Array.isArray(tool.keywords) && tool.keywords.some(k => k && k.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [query]);

  // Reset selected index if results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTools.length]);

  // Keyboard navigation inside search
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(idx => (idx + 1) % (filteredTools.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(idx => (idx - 1 + filteredTools.length) % (filteredTools.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        navigate(filteredTools[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.search-item.active');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="search-backdrop" onClick={onClose} role="presentation">
      <div
        className="search-dialog card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search Time Tools"
      >
        <div className="search-input-wrap">
          <SearchIcon size={20} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search all 20 time tools, clocks, timers... (Type or Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-controls="search-results-list"
          />
          {query && (
            <button
              className="btn btn-ghost btn-icon-sm search-clear"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search query"
            >
              <CloseIcon size={14} />
            </button>
          )}
          <span className="search-kbd-badge">ESC</span>
        </div>

        <div className="search-results" ref={listRef} id="search-results-list" role="listbox">
          {filteredTools.length === 0 ? (
            <div className="search-empty">
              <p className="text-muted text-sm">No tools found matching &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = idx === selectedIndex;
              const fav = isFavorite(tool.path);

              return (
                <div
                  key={tool.path}
                  className={`search-item ${isSelected ? 'active' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    navigate(tool.path);
                    onClose();
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="search-item-icon" aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div className="search-item-content">
                    <div className="search-item-title-row">
                      <span className="search-item-name">{tool.name}</span>
                      <span className="search-item-category badge">{tool.category}</span>
                    </div>
                    <p className="search-item-desc text-muted text-xs">{tool.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-icon-sm search-fav-btn ${fav ? 'favorited' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tool.path);
                    }}
                    aria-label={fav ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                    title={fav ? 'Favorited' : 'Favorite'}
                  >
                    <StarIcon size={16} filled={fav} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="search-footer">
          <div className="search-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
          <span className="text-xs text-muted">{filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
