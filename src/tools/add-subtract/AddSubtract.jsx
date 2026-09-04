import { useState } from 'react';
import SEO from '../../components/SEO';
import { toDatetimeLocal, addDuration } from '../../utils/time';
import './AddSubtract.css';

const UNITS = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];

export default function AddSubtract() {
  const [baseInput, setBaseInput] = useState(() => toDatetimeLocal(new Date()));
  const [operation, setOperation] = useState('add');
  const [amounts, setAmounts]     = useState({ years: '', months: '', days: '', hours: '', minutes: '', seconds: '' });
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  function updateAmount(unit, val) {
    setAmounts(prev => ({ ...prev, [unit]: val }));
  }

  function calculate() {
    setError('');
    if (!baseInput) { setError('Please select a base date.'); return; }
    const base = new Date(baseInput);
    if (isNaN(base)) { setError('Invalid date.'); return; }

    let date = base;
    const sign = operation === 'add' ? 1 : -1;

    for (const unit of UNITS) {
      const n = parseInt(amounts[unit]) || 0;
      if (n !== 0) date = addDuration(date, sign * n, unit);
    }

    setResult({
      input: base,
      output: date,
      label: new Intl.DateTimeFormat('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).format(date),
    });
  }

  function useNow() {
    setBaseInput(toDatetimeLocal(new Date()));
  }

  const hasAnyAmount = UNITS.some(u => parseInt(amounts[u]) > 0);

  return (
    <>
      <SEO
        title="Add / Subtract Time"
        description="Add or subtract years, months, days, hours, minutes, and seconds from any date and time."
        path="/add-subtract"
      />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Add / Subtract Time</h1>
          <p>Perform date arithmetic — add or subtract any duration from a date.</p>
        </div>

        <div className="card as-form">
          {/* Base date */}
          <div>
            <label className="field-label" htmlFor="as-base">Base date &amp; time</label>
            <div className="as-base-row">
              <input id="as-base" className="input" type="datetime-local" value={baseInput}
                onChange={e => setBaseInput(e.target.value)} />
              <button className="btn btn-secondary btn-sm" onClick={useNow}>Now</button>
            </div>
          </div>

          {/* Operation toggle */}
          <div className="as-op-row">
            <button
              className={`btn ${operation === 'add' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOperation('add')}
              aria-pressed={operation === 'add'}
            >+ Add</button>
            <button
              className={`btn ${operation === 'subtract' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setOperation('subtract')}
              aria-pressed={operation === 'subtract'}
            >− Subtract</button>
          </div>

          {/* Duration fields */}
          <div className="as-duration-grid">
            {UNITS.map(unit => (
              <div key={unit} className="as-unit">
                <label className="field-label" htmlFor={`as-${unit}`}>
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </label>
                <input
                  id={`as-${unit}`}
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amounts[unit]}
                  onChange={e => updateAmount(unit, e.target.value)}
                />
              </div>
            ))}
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>}

          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
            onClick={calculate}
          >
            Calculate
          </button>
        </div>

        {result && (
          <div className="card as-result animate-fade-in">
            <p className="field-label">Result</p>
            <p className="as-result-main">{result.label}</p>
            <p className="text-faint text-xs">ISO: {result.output.toISOString()}</p>
            <p className="text-faint text-xs">Unix: {Math.floor(result.output.getTime() / 1000)}</p>
          </div>
        )}
      </div>
    </>
  );
}
