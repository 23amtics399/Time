import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { convert12To24, convert24To12, pad } from '../../utils/time';
import './MilitaryTimeConverter.css';

const REFERENCE_HOURS = Array.from({ length: 24 }, (_, i) => {
  const converted = convert24To12(i, 0);
  return {
    h24: i,
    time24: `${pad(i)}:00`,
    military: `${pad(i)}00`,
    time12: converted.time12,
    pronunciation: converted.pronunciation,
  };
});

export default function MilitaryTimeConverter() {
  // 12-hour state
  const [h12, setH12] = useState('08');
  const [m12, setM12] = useState('30');
  const [ampm, setAmpm] = useState('AM');

  // 24-hour state
  const [time24Input, setTime24Input] = useState('20:45');

  // Converted results
  const resFrom12 = convert12To24(h12, m12, ampm);

  const [h24Part, m24Part] = time24Input.split(':').map(Number);
  const resFrom24 = !isNaN(h24Part) && !isNaN(m24Part) ? convert24To12(h24Part, m24Part) : null;

  return (
    <>
      <SEO path="/military-time-converter" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>12-Hour to 24-Hour Military Time Converter</h1>
          <p>Convert seamlessly between standard 12-hour AM/PM clock time, 24-hour time, and military time notation.</p>
        </div>

        <div className="mtc-converter-grid">
          {/* 12h -> 24h & Military */}
          <div className="card mtc-box">
            <h2 className="text-lg font-semibold">12-Hour → 24-Hour &amp; Military</h2>
            <div className="mtc-input-row">
              <input
                type="number"
                min="1"
                max="12"
                className="input"
                value={h12}
                onChange={e => setH12(e.target.value)}
                aria-label="12-Hour Hour"
                placeholder="HH"
              />
              <span className="text-xl font-bold">:</span>
              <input
                type="number"
                min="0"
                max="59"
                className="input"
                value={m12}
                onChange={e => setM12(e.target.value)}
                aria-label="Minute"
                placeholder="MM"
              />
              <select
                className="select mtc-select-sm"
                value={ampm}
                onChange={e => setAmpm(e.target.value)}
                aria-label="AM or PM"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>

            {resFrom12 && (
              <div className="mtc-display-box">
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">24-Hour Time</span>
                  <div className="mtc-display-val">{resFrom12.time24}</div>
                </div>
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">Military Time Format</span>
                  <div className="mtc-display-val" style={{ color: 'var(--success)' }}>{resFrom12.militaryTime} hours</div>
                </div>
                <div className="mtc-phonetic">
                  Spoken: &ldquo;{resFrom12.pronunciation}&rdquo;
                </div>
              </div>
            )}
          </div>

          {/* 24h -> 12h */}
          <div className="card mtc-box">
            <h2 className="text-lg font-semibold">24-Hour / Military → 12-Hour</h2>
            <div className="mtc-input-row">
              <input
                type="time"
                className="input"
                value={time24Input}
                onChange={e => setTime24Input(e.target.value)}
                aria-label="24-Hour Time Input"
              />
            </div>

            {resFrom24 && (
              <div className="mtc-display-box">
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">Standard 12-Hour Time</span>
                  <div className="mtc-display-val">{resFrom24.time12}</div>
                </div>
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">Military Representation</span>
                  <div className="mtc-display-val" style={{ color: 'var(--success)' }}>{resFrom24.militaryTime} hours</div>
                </div>
                <div className="mtc-phonetic">
                  Spoken: &ldquo;{resFrom24.pronunciation}&rdquo;
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 24-Hour Reference Table */}
        <div className="card mtc-table-wrap">
          <h2 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>24-Hour &amp; Military Time Conversion Chart</h2>
          <table className="mtc-table" aria-label="Military time conversion chart">
            <thead>
              <tr>
                <th>12-Hour Standard</th>
                <th>24-Hour Format</th>
                <th>Military Notation</th>
                <th>Spoken Pronunciation</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_HOURS.map(row => (
                <tr key={row.h24}>
                  <td className="font-medium">{row.time12}</td>
                  <td className="font-mono">{row.time24}</td>
                  <td className="font-mono" style={{ color: 'var(--accent)' }}>{row.military}</td>
                  <td className="text-muted">{row.pronunciation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ROUTES_SEO['/military-time-converter']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/military-time-converter'].guide} toolName="12-Hour to 24-Hour Military Time Converter" />
        )}
      </div>
    </>
  );
}
