import { useState, useCallback } from 'react';
import SEO from '../../components/SEO';
import { useNow } from '../../hooks/useNow';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTimeContext } from '../../contexts/TimeContext';
import { TIMEZONES } from '../../data/timezones';
import './WorldClock.css';

const DEFAULT_ZONES = [
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata',
  'Asia/Tokyo',
];

function ClockCard({ timezone, now, timeFormat, onRemove }) {
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

  return (
    <div className={`wc-card card ${isNight ? 'wc-night' : ''}`}>
      <div className="wc-card-header">
        <div className="wc-label-wrap">
          <span className="wc-icon" aria-hidden="true">{isNight ? '🌙' : isEvening ? '🌆' : '☀️'}</span>
          <div>
            <p className="wc-label">{label}</p>
            <p className="wc-offset text-faint text-xs">{offsetStr}</p>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon-sm wc-remove"
          onClick={() => onRemove(timezone)}
          aria-label={`Remove ${label}`}
        >
          <RemoveIcon />
        </button>
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
  const [zones, setZones] = useLocalStorage('worldclock-zones', DEFAULT_ZONES);
  const [selected, setSelected] = useState('');
  const now = useNow(true, 'second');

  const addZone = useCallback(() => {
    if (!selected || zones.includes(selected)) return;
    setZones(z => [...z, selected]);
    setSelected('');
  }, [selected, zones, setZones]);

  const removeZone = useCallback((tz) => {
    setZones(z => z.filter(x => x !== tz));
  }, [setZones]);

  const availableToAdd = TIMEZONES.filter(t => !zones.includes(t.value));

  return (
    <>
      <SEO
        title="World Clock"
        description="See the current time in multiple cities and timezones simultaneously. Add and remove timezones instantly."
        path="/world-clock"
      />

      <div className="tool-page">
        <div className="tool-header">
          <h1>World Clock</h1>
          <p>Live time in multiple timezones, side by side.</p>
        </div>

        {/* Add timezone */}
        <div className="wc-add card">
          <label className="field-label" htmlFor="wc-select">Add a timezone</label>
          <div className="wc-add-row">
            <select
              id="wc-select"
              className="select"
              value={selected}
              onChange={e => setSelected(e.target.value)}
            >
              <option value="">— pick a timezone —</option>
              {['Americas','Europe','Africa','Asia','Pacific','UTC'].map(region => (
                <optgroup key={region} label={region}>
                  {availableToAdd.filter(t => t.region === region).map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={addZone}
              disabled={!selected}
            >Add</button>
          </div>
        </div>

        {/* Clock grid */}
        {zones.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>
            No timezones added yet. Use the selector above to add one.
          </p>
        ) : (
          <div className="wc-grid">
            {zones.map(tz => (
              <ClockCard key={tz} timezone={tz} now={now} timeFormat={timeFormat} onRemove={removeZone} />
            ))}
          </div>
        )}
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
