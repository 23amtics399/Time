import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { TIMEZONES } from '../../data/timezones';
import { toDatetimeLocal } from '../../utils/time';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../../components/CopyButton';
import ShareButton from '../../components/ShareButton';
import { StarIcon, SearchIcon } from '../../components/icons';
import './TimezoneConverter.css';

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

function formatInZone(date, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      timeZoneName: 'shortOffset',
    }).format(date);
  } catch { return 'Invalid'; }
}

function getZoneOffsetMinutes(zone, date) {
  if (zone === 'UTC') return 0;
  try {
    const local = new Intl.DateTimeFormat('en-CA', {
      timeZone: zone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date);
    const [d, t] = local.split(', ');
    const [yr, mo, da] = d.split('-').map(Number);
    const [hr, mi, se] = t.split(':').map(Number);
    const localDate = new Date(Date.UTC(yr, mo - 1, da, hr, mi, se));
    return Math.round((localDate - date) / 60000);
  } catch { return 0; }
}

function SearchableTimezoneSelect({ value, onChange, label, id, favs, onToggleFav }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = useMemo(() => {
    return TIMEZONES.find(t => t.value === value) || { label: value, value };
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Prioritize favorites
      const favList = TIMEZONES.filter(t => favs.includes(t.value));
      const rest = TIMEZONES.filter(t => !favs.includes(t.value));
      return [...favList, ...rest].slice(0, 30);
    }
    return TIMEZONES.filter(t =>
      t.label.toLowerCase().includes(q) ||
      t.value.toLowerCase().includes(q) ||
      (t.region && t.region.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [query, favs]);

  return (
    <div className="tzc-combobox">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="field-label" htmlFor={id}>{label}</label>
        <button
          type="button"
          className={`btn btn-ghost btn-icon-sm ${favs.includes(value) ? 'text-amber' : 'text-faint'}`}
          onClick={() => onToggleFav(value)}
          aria-label="Toggle timezone favorite"
          title={favs.includes(value) ? 'Favorite timezone' : 'Add to favorites'}
        >
          <StarIcon filled={favs.includes(value)} style={{ width: 13, height: 13 }} />
        </button>
      </div>

      <div className="tzc-combo-trigger-wrap">
        <button
          id={id}
          type="button"
          className="input tzc-combo-trigger"
          onClick={() => setIsOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="tzc-combo-val">{selectedItem.label}</span>
          <span className="tzc-combo-caret" aria-hidden="true">▾</span>
        </button>

        {isOpen && (
          <div className="tzc-combo-menu card">
            <div className="tzc-combo-search-row">
              <span className="tzc-combo-search-icon" aria-hidden="true"><SearchIcon /></span>
              <input
                type="text"
                className="input input-sm tzc-combo-input"
                placeholder="Search city, country..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <ul className="tzc-combo-list" role="listbox">
              {filtered.map(t => {
                const isF = favs.includes(t.value);
                const isSelected = t.value === value;
                return (
                  <li key={t.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={`tzc-combo-option ${isSelected ? 'tzc-combo-option--selected' : ''}`}
                      onClick={() => {
                        onChange(t.value);
                        setIsOpen(false);
                        setQuery('');
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isF && <StarIcon filled style={{ width: 11, height: 11, color: 'var(--amber)' }} />}
                        {t.label}
                      </span>
                      <span className="text-faint text-xs">{t.value}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimezoneConverter() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [favs, setFavs] = useLocalStorage('timezone-favs', ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata']);

  const [fromZone, setFromZone] = useState('UTC');
  const [targetZones, setTargetZones] = useState(['Asia/Kolkata', 'Europe/London', 'America/New_York']);
  const [dtInput, setDtInput]   = useState(() => toDatetimeLocal(new Date()));
  const [error, setError]       = useState('');
  const [results, setResults]   = useState(null);

  // Initialize from query parameters if present
  useEffect(() => {
    const qFrom = searchParams.get('from');
    const qTo = searchParams.get('to');
    const qDt = searchParams.get('dt');
    if (qFrom) setFromZone(qFrom);
    if (qTo) setTargetZones([qTo]);
    if (qDt) setDtInput(qDt);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleFav(tz) {
    setFavs(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      if (arr.includes(tz)) {
        showToast('Removed from favorites');
        return arr.filter(x => x !== tz);
      } else {
        showToast('Saved to favorites');
        return [...arr, tz];
      }
    });
  }

  function addComparisonZone() {
    const available = TIMEZONES.find(t => t.value !== fromZone && !targetZones.includes(t.value));
    if (available && targetZones.length < 5) {
      setTargetZones(prev => [...prev, available.value]);
      showToast('Added comparison target');
    }
  }

  function removeTargetZone(zoneToRemove) {
    if (targetZones.length <= 1) {
      showToast('Keep at least one target timezone', 'error');
      return;
    }
    setTargetZones(prev => prev.filter(z => z !== zoneToRemove));
  }

  function convert() {
    setError('');
    if (!dtInput) { setError('Please select a date and time.'); return; }
    try {
      const [datePart, timePart] = dtInput.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      const approxUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const fromOffset = getZoneOffsetMinutes(fromZone, approxUTC);
      const utcTime = new Date(approxUTC.getTime() - fromOffset * 60000);

      const targets = targetZones.map(toZone => {
        const toOffset = getZoneOffsetMinutes(toZone, utcTime);
        const tzInfo = TIMEZONES.find(t => t.value === toZone);
        return {
          zone: toZone,
          label: tzInfo?.label || toZone,
          timeStr: formatInZone(utcTime, toZone),
          diffHours: Math.round((toOffset - fromOffset) / 60 * 10) / 10,
          dst: isObservingDst(toZone, utcTime),
        };
      });

      const fromTzInfo = TIMEZONES.find(t => t.value === fromZone);
      setResults({
        utc: utcTime,
        fromZone,
        fromLabel: fromTzInfo?.label || fromZone,
        fromStr: formatInZone(utcTime, fromZone),
        fromDst: isObservingDst(fromZone, utcTime),
        targets,
      });
    } catch {
      setError('Conversion failed. Please check the date and timezones.');
    }
  }

  // Auto-convert on initial render or state changes
  useEffect(() => {
    convert();
  }, [fromZone, targetZones, dtInput]); // eslint-disable-line react-hooks/exhaustive-deps

  function useNow() {
    setDtInput(toDatetimeLocal(new Date()));
    showToast('Set to current time');
  }

  function swapPrimary() {
    if (targetZones.length > 0) {
      const firstTarget = targetZones[0];
      const newTargets = [fromZone, ...targetZones.slice(1)];
      setFromZone(firstTarget);
      setTargetZones(newTargets);
    }
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/timezone?from=${encodeURIComponent(fromZone)}&to=${encodeURIComponent(targetZones[0] || 'UTC')}&dt=${encodeURIComponent(dtInput)}`
    : `https://time.sji.one/timezone?from=${encodeURIComponent(fromZone)}&to=${encodeURIComponent(targetZones[0] || 'UTC')}&dt=${encodeURIComponent(dtInput)}`;

  const copyResultsText = useMemo(() => {
    if (!results) return '';
    return [
      `Timezone Conversion:`,
      `Source: ${results.fromStr} (${results.fromLabel})`,
      ...results.targets.map(t => `Target: ${t.timeStr} (${t.label}) [${t.diffHours > 0 ? '+' : ''}${t.diffHours}h]`),
      `UTC: ${results.utc.toISOString()}`,
    ].join('\n');
  }, [results]);

  return (
    <>
      <SEO path="/timezone" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Timezone Converter</h1>
          <p>Search timezones, convert dates across multiple regions, and check Daylight Saving status.</p>
        </div>

        <div className="card tzc-form">
          {/* From Zone */}
          <div className="tzc-zones-section">
            <SearchableTimezoneSelect
              id="from-zone"
              value={fromZone}
              onChange={setFromZone}
              label="Source Timezone"
              favs={favs}
              onToggleFav={toggleFav}
            />

            <button
              type="button"
              className="btn btn-ghost btn-icon tzc-swap"
              onClick={swapPrimary}
              aria-label="Swap source and primary target"
              title="Swap"
            >
              <SwapIcon />
            </button>
          </div>

          {/* Date and Time Selector */}
          <div className="tzc-dt-row">
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="tz-dt">Date &amp; Time (in Source Zone)</label>
              <input
                id="tz-dt"
                className="input"
                type="datetime-local"
                value={dtInput}
                onChange={e => setDtInput(e.target.value)}
              />
            </div>
            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={useNow}>Now</button>
              <button type="button" className="btn btn-primary" onClick={convert}>Convert</button>
              <ShareButton
                url={shareUrl}
                title="Timezone Conversion"
                text={`Check out this time conversion between ${fromZone} and ${targetZones.join(', ')}`}
              />
              <CopyButton
                text={copyResultsText}
                label="Copy result"
                ariaLabel="Copy converted times"
              />
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>

        {/* Target Zones & Multi-Comparison */}
        {results && (
          <div className="tzc-results-wrap">
            <div className="tzc-results-header">
              <span className="field-label" style={{ margin: 0 }}>Target Timezones Comparison</span>
              {targetZones.length < 5 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={addComparisonZone}
                >
                  + Add Comparison Zone
                </button>
              )}
            </div>

            <div className="tzc-cards-grid">
              {results.targets.map((t) => (
                <div key={t.zone} className="card tzc-target-card">
                  <div className="tzc-target-header">
                    <div>
                      <p className="tzc-target-label font-semibold">{t.label}</p>
                      <p className="text-faint text-xs font-mono">{t.zone}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t.dst && (
                        <span className="badge badge-amber text-xs" title="Daylight Saving Time is active in this zone">
                          DST
                        </span>
                      )}
                      {targetZones.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon-sm text-muted"
                          onClick={() => removeTargetZone(t.zone)}
                          aria-label={`Remove ${t.label}`}
                          title="Remove zone"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="tzc-target-time font-mono">{t.timeStr}</p>

                  <div className="tzc-target-footer text-xs text-muted">
                    <span>Offset diff: <strong className="font-mono">{t.diffHours > 0 ? `+${t.diffHours}` : t.diffHours}h</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/timezone'].guide} toolName="Timezone Converter" />
      </div>
    </>
  );
}

function SwapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 6h14M12 2l4 4-4 4M16 12H2M6 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
