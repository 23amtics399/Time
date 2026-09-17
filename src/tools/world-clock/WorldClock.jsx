import { useState, useCallback, useMemo } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTimeContext } from '../../contexts/TimeContext';
import { useToast } from '../../contexts/ToastContext';
import { TIMEZONES } from '../../data/timezones';
import { StarIcon, ArrowUpIcon, ArrowDownIcon, SearchIcon } from '../../components/icons';
import './WorldClock.css';

const DEFAULT_ZONES = [
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Tokyo',
];

const POPULAR_CHIPS = [
  { label: 'New York', tz: 'America/New_York' },
  { label: 'London', tz: 'Europe/London' },
  { label: 'Tokyo', tz: 'Asia/Tokyo' },
  { label: 'Kolkata', tz: 'Asia/Kolkata' },
  { label: 'Dubai', tz: 'Asia/Dubai' },
  { label: 'Sydney', tz: 'Australia/Sydney' },
  { label: 'Paris', tz: 'Europe/Paris' },
  { label: 'Singapore', tz: 'Asia/Singapore' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles' },
];

function isObservingDst(tz, date = new Date()) {
  try {
    const year = date.getFullYear();
    const jan = new Date(year, 0, 1);
    const jul = new Date(year, 6, 1);
    const getOffsetMin = (d) => {
      const str = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      }).format(d);
      const match = str.match(/(\d+)\/(\d+)\/(\d+),\s+(\d+):(\d+):(\d+)/);
      if (!match) return 0;
      const asUtc = Date.UTC(+match[3], +match[1] - 1, +match[2], +match[4], +match[5], +match[6]);
      return (asUtc - d.getTime()) / 60000;
    };
    const minJan = getOffsetMin(jan);
    const minJul = getOffsetMin(jul);
    if (minJan === minJul) return false;
    const minNow = getOffsetMin(date);
    return minNow > Math.min(minJan, minJul);
  } catch {
    return false;
  }
}

function ClockCard({
  timezone,
  now,
  timeFormat,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isFav,
  onToggleFav,
}) {
  const tz = TIMEZONES.find(t => t.value === timezone);
  const label = tz ? tz.label : timezone;

  const fmt = (opts) => {
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: timezone, ...opts }).format(now);
    } catch { return '—'; }
  };

  const hour12 = timeFormat === '12h';
  const timeStr = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12 });
  const dateStr = fmt({ weekday: 'short', month: 'short', day: 'numeric' });
  const offsetStr = fmt({ timeZoneName: 'shortOffset' }).split(' ').pop() || '';

  const hour = Number(fmt({ hour: 'numeric', hour12: false })) % 24;
  const isNight = hour < 6 || hour >= 20;
  const isEvening = hour >= 18 && hour < 20;
  const dstActive = isObservingDst(timezone, now);

  return (
    <div className={`wc-card card ${isNight ? 'wc-night' : ''} ${isFav ? 'wc-fav-card' : ''}`}>
      <div className="wc-card-header">
        <div className="wc-label-wrap">
          <span className="wc-icon" aria-hidden="true">{isNight ? '🌙' : isEvening ? '🌆' : '☀️'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <p className="wc-label">{label}</p>
              {isFav && (
                <span title="Favorited" aria-label="Favorited">
                  <StarIcon filled style={{ width: 13, height: 13, color: 'var(--amber)' }} />
                </span>
              )}
            </div>
            <div className="wc-meta-row">
              <span className="wc-offset text-faint text-xs">{offsetStr}</span>
              {dstActive && (
                <span className="badge badge-amber text-xs wc-dst-badge" title="Daylight Saving Time is currently in effect">
                  DST
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card action buttons */}
        <div className="wc-card-actions">
          <button
            type="button"
            className={`btn btn-ghost btn-icon-sm ${isFav ? 'text-amber' : 'wc-btn-faint'}`}
            onClick={() => onToggleFav(timezone)}
            aria-label={isFav ? `Unfavorite ${label}` : `Favorite ${label}`}
            title={isFav ? 'Unfavorite' : 'Favorite'}
          >
            <StarIcon filled={isFav} style={{ width: 14, height: 14 }} />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-icon-sm wc-btn-faint"
            onClick={() => onMoveUp(timezone)}
            disabled={isFirst}
            aria-label={`Move ${label} up`}
            title="Move up"
          >
            <ArrowUpIcon />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-icon-sm wc-btn-faint"
            onClick={() => onMoveDown(timezone)}
            disabled={isLast}
            aria-label={`Move ${label} down`}
            title="Move down"
          >
            <ArrowDownIcon />
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-icon-sm wc-remove"
            onClick={() => onRemove(timezone)}
            aria-label={`Remove ${label}`}
            title="Remove clock"
          >
            <RemoveIcon />
          </button>
        </div>
      </div>

      <div className="wc-time display font-mono" role="timer" aria-live="polite" aria-label={`Time in ${label}`}>
        {timeStr}
      </div>
      <p className="wc-date text-muted text-sm">{dateStr}</p>
    </div>
  );
}

export default function WorldClock() {
  const { timeFormat } = useTimeContext();
  const { showToast } = useToast();
  const [zones, setZones] = useLocalStorage('worldclock-zones', DEFAULT_ZONES);
  const [favs, setFavs] = useLocalStorage('worldclock-favs', []);
  const [searchQuery, setSearchQuery] = useState('');
  const now = useNow(true, 'second');

  const addZoneByTz = useCallback((tzValue) => {
    if (!tzValue || zones.includes(tzValue)) return;
    setZones(prev => [...prev, tzValue]);
    setSearchQuery('');
    showToast('Timezone added');
  }, [zones, setZones, showToast]);

  const removeZone = useCallback((tz) => {
    setZones(prev => prev.filter(x => x !== tz));
    setFavs(prev => (Array.isArray(prev) ? prev.filter(x => x !== tz) : []));
    showToast('Timezone removed');
  }, [setZones, setFavs, showToast]);

  const toggleFav = useCallback((tz) => {
    setFavs(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(tz)) {
        showToast('Removed from favorites');
        return arr.filter(x => x !== tz);
      } else {
        showToast('Added to favorites');
        return [...arr, tz];
      }
    });
  }, [setFavs, showToast]);

  const moveUp = useCallback((tz) => {
    setZones(prev => {
      const idx = prev.indexOf(tz);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  }, [setZones]);

  const moveDown = useCallback((tz) => {
    setZones(prev => {
      const idx = prev.indexOf(tz);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return copy;
    });
  }, [setZones]);

  // Search filtered timezones
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return TIMEZONES.filter(t => {
      if (zones.includes(t.value)) return false;
      const labelMatch = t.label.toLowerCase().includes(q);
      const valMatch = t.value.toLowerCase().includes(q);
      const regionMatch = t.region ? t.region.toLowerCase().includes(q) : false;
      return labelMatch || valMatch || regionMatch;
    }).slice(0, 10);
  }, [searchQuery, zones]);

  return (
    <>
      <SEO path="/world-clock" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>World Clock</h1>
          <p>Live time in multiple timezones, side by side.</p>
        </div>

        {/* Searchable selector & Quick Add */}
        <div className="wc-add card">
          <label className="field-label" htmlFor="wc-search-input">
            Search &amp; Add City or Timezone
          </label>
          <div className="wc-search-container">
            <div className="wc-search-input-wrap">
              <span className="wc-search-icon" aria-hidden="true"><SearchIcon /></span>
              <input
                id="wc-search-input"
                type="text"
                className="input wc-search-input"
                placeholder="Search city, country, or timezone (e.g. Tokyo, Dubai, Paris, Mumbai)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="wc-clear-search"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search autocomplete dropdown */}
            {searchResults.length > 0 && (
              <ul className="wc-search-dropdown" role="listbox">
                {searchResults.map(tz => (
                  <li key={tz.value}>
                    <button
                      type="button"
                      className="wc-search-dropdown-item"
                      onClick={() => addZoneByTz(tz.value)}
                    >
                      <span className="wc-dropdown-label">{tz.label}</span>
                      <span className="wc-dropdown-val text-faint text-xs">{tz.value}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <p className="text-faint text-xs" style={{ marginTop: '0.5rem', padding: '0 0.5rem' }}>
                No matching new timezones found.
              </p>
            )}
          </div>

          {/* Quick Add Chips */}
          <div className="wc-chips-wrap">
            <span className="text-xs text-muted">Quick add:</span>
            <div className="wc-chips">
              {POPULAR_CHIPS.map(chip => {
                const isAdded = zones.includes(chip.tz);
                return (
                  <button
                    key={chip.tz}
                    type="button"
                    className={`btn btn-sm ${isAdded ? 'btn-ghost' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    onClick={() => !isAdded && addZoneByTz(chip.tz)}
                    disabled={isAdded}
                    title={isAdded ? 'Already added' : `Add ${chip.label}`}
                  >
                    {chip.label} {isAdded && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clock grid */}
        {zones.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>
            No timezones added yet. Use the search bar above to add one.
          </p>
        ) : (
          <div className="wc-grid">
            {zones.map((tz, index) => (
              <ClockCard
                key={tz}
                timezone={tz}
                now={now}
                timeFormat={timeFormat}
                onRemove={removeZone}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                isFirst={index === 0}
                isLast={index === zones.length - 1}
                isFav={Array.isArray(favs) && favs.includes(tz)}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/world-clock'].guide} toolName="World Clock" />
      </div>
    </>
  );
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
