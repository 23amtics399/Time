import { useState } from 'react';
import SEO from '../../components/SEO';
import { dateDiff, toDatetimeLocal } from '../../utils/time';
import './TimeDiff.css';

function StatBox({ label, value, sub }) {
  return (
    <div className="td-stat card">
      <p className="td-stat-val font-mono">{value.toLocaleString()}</p>
      <p className="td-stat-label text-muted text-sm">{label}</p>
      {sub && <p className="text-faint text-xs">{sub}</p>}
    </div>
  );
}

export default function TimeDiff() {
  const now = new Date();
  const [from, setFrom] = useState(toDatetimeLocal(new Date(now.getTime() - 3600000)));
  const [to,   setTo]   = useState(toDatetimeLocal(now));
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState('');

  function calculate() {
    setError('');
    if (!from || !to) { setError('Please fill in both dates.'); return; }
    const f = new Date(from);
    const t = new Date(to);
    if (isNaN(f) || isNaN(t)) { setError('Invalid date.'); return; }
    const diff = dateDiff(f, t);
    setResult({ ...diff, from: f, to: t });
  }

  function useNow(field) {
    const val = toDatetimeLocal(new Date());
    if (field === 'from') setFrom(val);
    else setTo(val);
  }

  return (
    <>
      <SEO
        title="Time Difference Calculator"
        description="Calculate the exact difference between two dates and times in days, hours, minutes, and seconds."
        path="/time-diff"
      />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Time Difference Calculator</h1>
          <p>Find the exact gap between two points in time.</p>
        </div>

        <div className="card td-form">
          <div className="td-inputs">
            <div>
              <label className="field-label" htmlFor="td-from">Start date &amp; time</label>
              <div className="td-input-row">
                <input id="td-from" className="input" type="datetime-local" value={from}
                  onChange={e => setFrom(e.target.value)} />
                <button className="btn btn-secondary btn-sm" onClick={() => useNow('from')}>Now</button>
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="td-to">End date &amp; time</label>
              <div className="td-input-row">
                <input id="td-to" className="input" type="datetime-local" value={to}
                  onChange={e => setTo(e.target.value)} />
                <button className="btn btn-secondary btn-sm" onClick={() => useNow('to')}>Now</button>
              </div>
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={calculate}>
            Calculate
          </button>
        </div>

        {result && (
          <div className="td-results animate-fade-in">
            {/* Human readable headline */}
            <div className="card td-headline">
              <p className="td-headline-text">
                <span style={{ color: result.sign >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {result.sign < 0 ? 'The end date is before the start date. ' : ''}
                </span>
                <strong>{result.days}</strong> day{result.days !== 1 ? 's' : ''},{' '}
                <strong>{result.hours}</strong> hour{result.hours !== 1 ? 's' : ''},{' '}
                <strong>{result.minutes}</strong> minute{result.minutes !== 1 ? 's' : ''},{' '}
                <strong>{result.seconds}</strong> second{result.seconds !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Stat grid */}
            <div className="td-stat-grid">
              <StatBox label="Total days"    value={result.totalDays}    sub={`${result.totalDays * 24} hours`} />
              <StatBox label="Total hours"   value={result.totalHours}   sub={`${result.totalMinutes} minutes`} />
              <StatBox label="Total minutes" value={result.totalMinutes} sub={`${result.totalSeconds} seconds`} />
              <StatBox label="Total seconds" value={result.totalSeconds} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
