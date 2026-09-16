import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { convertTimeUnits, TIME_UNIT_LABELS } from '../../utils/time';
import './TimeUnitConverter.css';

const UNITS = ['weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds'];

export default function TimeUnitConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [sourceUnit, setSourceUnit] = useLocalStorage('tuc-source-unit', 'hours');
  const [copiedKey, setCopiedKey] = useState('');

  const results = convertTimeUnits(inputValue, sourceUnit);

  function copy(text, key) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(String(text)).then(() => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(''), 2000);
      });
    }
  }

  return (
    <>
      <SEO path="/time-converter" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Time Unit Converter</h1>
          <p>Convert durations across weeks, days, hours, minutes, seconds, milliseconds, and microseconds simultaneously.</p>
        </div>

        <div className="card tuc-form">
          <div className="tuc-input-row">
            <div className="tuc-input-group">
              <label className="field-label" htmlFor="tuc-val-input">Duration value</label>
              <input
                id="tuc-val-input"
                className="input"
                type="number"
                step="any"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Enter a time value..."
              />
            </div>

            <div className="tuc-select-group">
              <label className="field-label" htmlFor="tuc-unit-select">Time unit</label>
              <select
                id="tuc-unit-select"
                className="select"
                value={sourceUnit}
                onChange={e => setSourceUnit(e.target.value)}
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{TIME_UNIT_LABELS[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {results && (
            <div className="tuc-compound-card">
              <div className="tuc-compound-title">Compound Duration Breakdown</div>
              <div className="tuc-compound-val">{results.compoundText}</div>
            </div>
          )}
        </div>

        {results && (
          <div className="tuc-grid" aria-label="Converted time units">
            {UNITS.map(unit => {
              const val = results[unit];
              const isSource = unit === sourceUnit;
              return (
                <div key={unit} className={`card tuc-card ${isSource ? 'tuc-card--active' : ''}`}>
                  <div className="tuc-card-info">
                    <span className="tuc-unit-label">{TIME_UNIT_LABELS[unit]}</span>
                    <span className="tuc-unit-val" title={val}>{val}</span>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copy(val, unit)}
                    aria-label={`Copy ${TIME_UNIT_LABELS[unit]} value`}
                  >
                    {copiedKey === unit ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {ROUTES_SEO['/time-converter']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/time-converter'].guide} toolName="Time Unit Converter" />
        )}
      </div>
    </>
  );
}
