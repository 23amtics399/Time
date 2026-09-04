import { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import { useNow } from '../../hooks/useNow';
import { toUnix, fromUnix, pad } from '../../utils/time';
import './UnixTimestamp.css';

function formatFull(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
  }).format(date);
}

export default function UnixTimestamp() {
  const now = useNow(true, 'second');
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [tsResult, setTsResult] = useState(null);
  const [dateResult, setDateResult] = useState(null);
  const [tsError, setTsError] = useState('');
  const [dateError, setDateError] = useState('');
  const [copied, setCopied] = useState('');

  // Live counter
  const liveUnix = toUnix(now);
  const liveMs   = now.getTime();

  function convertTs() {
    setTsError('');
    const n = Number(tsInput.trim());
    if (!tsInput.trim() || isNaN(n)) { setTsError('Enter a valid number.'); return; }
    // Auto-detect ms vs seconds
    const date = n > 1e12 ? new Date(n) : fromUnix(n);
    if (isNaN(date.getTime())) { setTsError('Invalid timestamp.'); return; }
    setTsResult(date);
  }

  function convertDate() {
    setDateError('');
    if (!dateInput) { setDateError('Pick a date and time.'); return; }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) { setDateError('Invalid date.'); return; }
    setDateResult({ unix: toUnix(date), ms: date.getTime() });
  }

  function copy(text, key) {
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  function useCurrentTs() {
    setTsInput(String(liveUnix));
    setTsResult(now);
    setTsError('');
  }

  function useCurrentDate() {
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setDateInput(iso);
    setDateResult({ unix: toUnix(now), ms: now.getTime() });
    setDateError('');
  }

  return (
    <>
      <SEO
        title="Unix Timestamp Converter"
        description="Convert Unix timestamps to human-readable dates and back. Live epoch counter included."
        path="/unix"
      />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Unix Timestamp Converter</h1>
          <p>Convert between Unix epoch and human-readable dates.</p>
        </div>

        {/* Live counter */}
        <div className="card unix-live">
          <p className="field-label">Current Unix Timestamp</p>
          <div className="unix-live-row">
            <div>
              <p className="unix-live-val font-mono" role="timer" aria-live="polite" aria-label="Current Unix timestamp">
                {liveUnix}
                <span className="text-muted text-sm"> s</span>
              </p>
              <p className="text-faint text-xs">{liveMs} ms</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => copy(liveUnix, 'live-s')}>
                {copied === 'live-s' ? 'Copied!' : 'Copy (s)'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => copy(liveMs, 'live-ms')}>
                {copied === 'live-ms' ? 'Copied!' : 'Copy (ms)'}
              </button>
            </div>
          </div>
          <p className="unix-human text-muted text-sm">{formatFull(now)}</p>
        </div>

        {/* Timestamp → Date */}
        <div className="card unix-section">
          <h2 className="unix-section-title">Timestamp → Human Date</h2>
          <label className="field-label" htmlFor="ts-input">Unix timestamp (seconds or milliseconds)</label>
          <div className="unix-input-row">
            <input
              id="ts-input"
              className={`input ${tsError ? 'unix-error-input' : ''}`}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1700000000"
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && convertTs()}
            />
            <button className="btn btn-primary" onClick={convertTs}>Convert</button>
            <button className="btn btn-secondary" onClick={useCurrentTs}>Now</button>
          </div>
          {tsError && <p className="unix-error text-sm">{tsError}</p>}
          {tsResult && (
            <div className="unix-result">
              <p className="unix-result-main">{formatFull(tsResult)}</p>
              <p className="text-faint text-xs">UTC: {tsResult.toUTCString()}</p>
              <p className="text-faint text-xs">ISO 8601: {tsResult.toISOString()}</p>
            </div>
          )}
        </div>

        {/* Date → Timestamp */}
        <div className="card unix-section">
          <h2 className="unix-section-title">Human Date → Timestamp</h2>
          <label className="field-label" htmlFor="date-input">Date and time</label>
          <div className="unix-input-row">
            <input
              id="date-input"
              className={`input ${dateError ? 'unix-error-input' : ''}`}
              type="datetime-local"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={convertDate}>Convert</button>
            <button className="btn btn-secondary" onClick={useCurrentDate}>Now</button>
          </div>
          {dateError && <p className="unix-error text-sm">{dateError}</p>}
          {dateResult && (
            <div className="unix-result">
              <div className="unix-result-pair">
                <div>
                  <p className="field-label">Seconds</p>
                  <p className="unix-result-num font-mono">{dateResult.unix}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(dateResult.unix, 'dr-s')}>
                  {copied === 'dr-s' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="unix-result-pair">
                <div>
                  <p className="field-label">Milliseconds</p>
                  <p className="unix-result-num font-mono">{dateResult.ms}</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copy(dateResult.ms, 'dr-ms')}>
                  {copied === 'dr-ms' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
