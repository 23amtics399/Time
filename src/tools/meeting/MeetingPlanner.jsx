import { useState, useCallback } from 'react';
import SEO from '../../components/SEO';
import { useNow } from '../../hooks/useNow';
import { TIMEZONES } from '../../data/timezones';
import { toDatetimeLocal } from '../../utils/time';
import './MeetingPlanner.css';

const DEFAULT_ZONES = ['America/New_York', 'Europe/London', 'Asia/Kolkata'];

const WORK_HOURS = { start: 9, end: 18 };

function getSlotClass(hour) {
  if (hour >= WORK_HOURS.start && hour < WORK_HOURS.end) return 'mp-slot-work';
  if (hour >= 18 || hour < 6) return 'mp-slot-night';
  return 'mp-slot-off';
}

function ZoneRow({ timezone, baseUtc, onRemove, highlightHour, onHover }) {
  const tz = TIMEZONES.find(t => t.value === timezone);
  const label = tz?.label || timezone;
  const hours = Array.from({ length: 24 }, (_, i) => {
    const utcHour = new Date(baseUtc.getTime() + i * 3600000);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, hour: 'numeric', hour12: false,
    }).format(utcHour);
  });

  const currentHour = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hour: 'numeric', hour12: false,
  }).format(new Date())) % 24;

  return (
    <div className="mp-zone-row">
      <div className="mp-zone-label">
        <span className="mp-zone-name text-sm">{label}</span>
        <button className="btn btn-ghost btn-icon-sm" onClick={() => onRemove(timezone)} aria-label={`Remove ${label}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="mp-slots">
        {hours.map((h, i) => {
          const localH = Number(h) % 24;
          return (
            <div
              key={i}
              className={`mp-slot ${getSlotClass(localH)} ${highlightHour === i ? 'mp-slot-highlight' : ''} ${currentHour === localH ? 'mp-slot-current' : ''}`}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              title={`${String(localH).padStart(2, '0')}:00`}
              role="gridcell"
              aria-label={`${label} at ${String(localH).padStart(2, '0')}:00`}
            >
              {i % 3 === 0 && <span className="mp-slot-hour">{String(localH).padStart(2, '0')}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MeetingPlanner() {
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [selected, setSelected] = useState('');
  const [highlightHour, setHighlightHour] = useState(null);
  const now = useNow(true, 'second');

  // Base UTC: start of today (00:00 UTC)
  const baseUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const addZone = useCallback(() => {
    if (!selected || zones.includes(selected)) return;
    setZones(z => [...z, selected]);
    setSelected('');
  }, [selected, zones]);

  const removeZone = (tz) => setZones(z => z.filter(x => x !== tz));

  const available = TIMEZONES.filter(t => !zones.includes(t.value));

  return (
    <>
      <SEO
        title="Meeting Planner"
        description="Compare time zones side-by-side to find the best meeting time for distributed teams."
        path="/meeting"
      />

      <div className="tool-page mp-page">
        <div className="tool-header">
          <h1>Meeting Planner</h1>
          <p>Find the best time to meet across multiple timezones. Hover over slots to compare.</p>
        </div>

        {/* Add zone */}
        <div className="card mp-add">
          <div className="mp-add-row">
            <select className="select" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="">— add a timezone —</option>
              {['Americas','Europe','Africa','Asia','Pacific','UTC'].map(region => (
                <optgroup key={region} label={region}>
                  {available.filter(t => t.region === region).map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="btn btn-primary" onClick={addZone} disabled={!selected}>Add</button>
          </div>
          {/* Legend */}
          <div className="mp-legend">
            <span><span className="mp-legend-dot mp-legend-work" /> Work hours (9–18)</span>
            <span><span className="mp-legend-dot mp-legend-off" /> Off hours</span>
            <span><span className="mp-legend-dot mp-legend-night" /> Night (18–6)</span>
            <span><span className="mp-legend-dot mp-legend-current" /> Current hour</span>
          </div>
        </div>

        {/* Grid */}
        <div className="card mp-grid" role="grid" aria-label="Meeting time grid">
          {/* Hour header */}
          <div className="mp-zone-row mp-header-row">
            <div className="mp-zone-label" />
            <div className="mp-slots mp-hour-labels">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className={`mp-slot mp-header-slot ${highlightHour === i ? 'mp-slot-highlight' : ''}`}>
                  {i % 3 === 0 && <span className="mp-slot-hour">{String(i).padStart(2, '0')}</span>}
                </div>
              ))}
            </div>
          </div>

          {zones.map(tz => (
            <ZoneRow
              key={tz}
              timezone={tz}
              baseUtc={baseUtc}
              onRemove={removeZone}
              highlightHour={highlightHour}
              onHover={setHighlightHour}
            />
          ))}

          {zones.length === 0 && (
            <p className="text-muted text-sm" style={{ padding: '1rem', textAlign: 'center' }}>
              Add timezones above to compare.
            </p>
          )}
        </div>

        <p className="text-faint text-xs" style={{ textAlign: 'center' }}>
          Showing 24 hours for today (UTC {baseUtc.toDateString()})
        </p>
      </div>
    </>
  );
}
