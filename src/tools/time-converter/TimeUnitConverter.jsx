import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { convertTimeUnits, TIME_UNIT_LABELS } from '../../utils/time';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../../components/CopyButton';
import ShareButton from '../../components/ShareButton';
import './TimeUnitConverter.css';

const UNITS = ['weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', 'microseconds'];

export default function TimeUnitConverter() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('1');
  const [sourceUnit, setSourceUnit] = useLocalStorage('tuc-source-unit', 'hours');

  // Read query params on mount
  useEffect(() => {
    const qVal = searchParams.get('val');
    const qFrom = searchParams.get('from');
    if (qVal) setInputValue(qVal);
    if (qFrom && UNITS.includes(qFrom)) setSourceUnit(qFrom);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const results = convertTimeUnits(inputValue, sourceUnit);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/time-converter?val=${encodeURIComponent(inputValue)}&from=${encodeURIComponent(sourceUnit)}`
    : `https://time.sji.one/time-converter?val=${encodeURIComponent(inputValue)}&from=${encodeURIComponent(sourceUnit)}`;

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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <ShareButton
              url={shareUrl}
              title={`Convert ${inputValue} ${TIME_UNIT_LABELS[sourceUnit]}`}
              text={`Conversion for ${inputValue} ${TIME_UNIT_LABELS[sourceUnit]} on Time Tools`}
            />
            {results?.compoundText && (
              <CopyButton
                text={`${inputValue} ${TIME_UNIT_LABELS[sourceUnit]} = ${results.compoundText}`}
                label="Copy breakdown"
                ariaLabel="Copy duration breakdown"
              />
            )}
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
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(String(val)).then(() => {
                          showToast(`Copied ${TIME_UNIT_LABELS[unit]}`);
                        });
                      }
                    }}
                    aria-label={`Copy ${TIME_UNIT_LABELS[unit]} value`}
                  >
                    Copy
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
