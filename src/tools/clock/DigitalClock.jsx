import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { useTimeContext } from '../../contexts/TimeContext';
import { pad } from '../../utils/time';
import './DigitalClock.css';

const TIMEZONES_SIMPLE = [
  { value: 'local', label: 'Local time' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

function getTimeInZone(now, timezone) {
  if (timezone === 'local') {
    return {
      hours:   now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
      dateStr: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };
  }
  const fmt = (opts) => new Intl.DateTimeFormat('en-US', { timeZone: timezone, ...opts }).format(now);
  return {
    hours:   Number(fmt({ hour: 'numeric', hour12: false })) % 24,
    minutes: Number(fmt({ minute: '2-digit' })),
    seconds: Number(fmt({ second: '2-digit' })),
    dateStr: fmt({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  };
}

export default function DigitalClock() {
  const [showSeconds, setShowSec] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const { timezone, setTimezone, useGlobalTimezone, setUseGlobalTimezone, timeFormat, setTimeFormat } = useTimeContext();
  const now = useNow(true, 'second');
  
  const is24h = timeFormat === '24h';

  const { hours: h, minutes: m, seconds: s, dateStr } = getTimeInZone(now, timezone);
  const displayH = is24h ? h : (h % 12 || 12);
  const ampm = h < 12 ? 'AM' : 'PM';

  function toggleFullscreen() {
    setFullscreen(f => !f);
  }

  return (
    <>
      <SEO path="/clock" />

      <div className={`dc-page ${fullscreen ? 'dc-fullscreen' : ''}`}>
        {fullscreen && (
          <button className="btn btn-ghost exit-fullscreen" onClick={toggleFullscreen} aria-label="Exit full screen">
            <ExitFullscreenIcon />
          </button>
        )}

        {!fullscreen && (
          <div className="tool-header">
            <h1>Digital Clock</h1>
            <p>Full-screen digital clock with 12/24-hour format and timezone support.</p>
          </div>
        )}

        <div className="dc-clock-wrap" role="timer" aria-live="polite" aria-label="Current time">
          <div className="dc-time display display-hero display-accent">
            <span>{pad(displayH)}</span>
            <span className="dc-colon">:</span>
            <span>{pad(m)}</span>
            {showSeconds && (
              <>
                <span className="dc-colon">:</span>
                <span className="dc-seconds">{pad(s)}</span>
              </>
            )}
            {!is24h && <span className="dc-ampm">{ampm}</span>}
          </div>
          <p className="dc-date text-muted">{dateStr}</p>
        </div>

        {!fullscreen && (
          <>
            <div className="dc-controls card">
              <div className="dc-controls-row">
                <label className="field-label" htmlFor="dc-tz-select">Timezone</label>
                <select
                  id="dc-tz-select"
                  className="select"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                >
                  {TIMEZONES_SIMPLE.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <label className="dc-sync-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useGlobalTimezone} onChange={e => setUseGlobalTimezone(e.target.checked)} />
                  <span className="text-sm text-muted">Use this timezone across Time</span>
                </label>
              </div>

              <div className="dc-toggles">
                <button
                  className={`btn ${is24h ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTimeFormat('24h')}
                  aria-pressed={is24h}
                >24h</button>
                <button
                  className={`btn ${!is24h ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTimeFormat('12h')}
                  aria-pressed={!is24h}
                >12h</button>

                <button
                  className={`btn ${showSeconds ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setShowSec(s => !s)}
                  aria-pressed={showSeconds}
                >
                  {showSeconds ? 'Seconds on' : 'Seconds off'}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={toggleFullscreen}
                  aria-label="Go full screen"
                >
                  <FullscreenIcon /> Full screen
                </button>
              </div>
            </div>

            <ToolGuide guide={ROUTES_SEO['/clock'].guide} toolName="Digital Clock" />
          </>
        )}
      </div>
    </>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1h4M1 1v4M15 1h-4M15 1v4M1 15h4M1 15v-4M15 15h-4M15 15v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ExitFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 1v4H1M13 1v4h4M5 17v-4H1M13 17v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
