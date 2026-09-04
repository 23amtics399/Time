import { useState } from 'react';
import SEO from '../../components/SEO';
import { TIMEZONES } from '../../data/timezones';
import { toDatetimeLocal } from '../../utils/time';
import './TimezoneConverter.css';

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

function TZSelect({ id, value, onChange, label }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={e => onChange(e.target.value)}>
        {['Americas','Europe','Africa','Asia','Pacific','UTC'].map(region => (
          <optgroup key={region} label={region}>
            {TIMEZONES.filter(t => t.region === region).map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default function TimezoneConverter() {
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone,   setToZone]   = useState('Asia/Kolkata');
  const [dtInput, setDtInput]   = useState(() => toDatetimeLocal(new Date()));
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  function convert() {
    setError('');
    if (!dtInput) { setError('Please select a date and time.'); return; }
    // Parse the datetime-local value as if it's in the fromZone
    // We do this by formatting the local date and adjusting using Intl
    try {
      const localDate = new Date(dtInput);
      if (isNaN(localDate.getTime())) throw new Error();

      // Get the UTC offset of the fromZone at that moment (use a trick: format UTC time in fromZone)
      // Parse dtInput as if it represents "wall clock time" in fromZone
      // Best approach: construct the time in fromZone by finding offset
      const [datePart, timePart] = dtInput.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Get offset of fromZone at approximate UTC time
      const approxUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));
      const fromOffset = getZoneOffsetMinutes(fromZone, approxUTC);
      const utcTime = new Date(approxUTC.getTime() - fromOffset * 60000);
      const toOffset = getZoneOffsetMinutes(toZone, utcTime);

      setResult({
        utc:      utcTime,
        fromStr:  formatInZone(utcTime, fromZone),
        toStr:    formatInZone(utcTime, toZone),
        fromZone: TIMEZONES.find(t => t.value === fromZone)?.label || fromZone,
        toZone:   TIMEZONES.find(t => t.value === toZone)?.label || toZone,
        diffHours: Math.round((toOffset - fromOffset) / 60 * 10) / 10,
      });
    } catch {
      setError('Conversion failed. Please check the date and timezones.');
    }
  }

  function getZoneOffsetMinutes(zone, date) {
    if (zone === 'UTC') return 0;
    try {
      // Format date in zone and in UTC, compute difference
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

  function useNow() {
    setDtInput(toDatetimeLocal(new Date()));
  }

  function swap() {
    setFromZone(toZone);
    setToZone(fromZone);
    setResult(null);
  }

  return (
    <>
      <SEO
        title="Timezone Converter"
        description="Convert a date and time between any two timezones instantly, with offset comparison."
        path="/timezone"
      />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Timezone Converter</h1>
          <p>Convert any date and time between two timezones.</p>
        </div>

        <div className="card tzc-form">
          <div className="tzc-zones">
            <TZSelect id="from-zone" value={fromZone} onChange={setFromZone} label="From timezone" />
            <button className="btn btn-ghost btn-icon tzc-swap" onClick={swap} aria-label="Swap timezones" title="Swap">
              <SwapIcon />
            </button>
            <TZSelect id="to-zone" value={toZone} onChange={setToZone} label="To timezone" />
          </div>

          <div className="tzc-dt-row">
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="tz-dt">Date and time</label>
              <input
                id="tz-dt"
                className="input"
                type="datetime-local"
                value={dtInput}
                onChange={e => setDtInput(e.target.value)}
              />
            </div>
            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={useNow}>Now</button>
              <button className="btn btn-primary" onClick={convert}>Convert</button>
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>

        {result && (
          <div className="card tzc-result">
            <div className="tzc-result-row">
              <div className="tzc-result-item">
                <p className="field-label">{result.fromZone}</p>
                <p className="tzc-result-time font-mono">{result.fromStr}</p>
              </div>
              <div className="tzc-arrow" aria-hidden="true">→</div>
              <div className="tzc-result-item">
                <p className="field-label">{result.toZone}</p>
                <p className="tzc-result-time font-mono" style={{ color: 'var(--accent)' }}>{result.toStr}</p>
              </div>
            </div>
            <p className="text-muted text-sm tzc-diff">
              UTC: {result.utc.toISOString()} ·
              Offset difference: {result.diffHours > 0 ? '+' : ''}{result.diffHours}h
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function SwapIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M2 6h14M12 2l4 4-4 4M16 12H2M6 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
