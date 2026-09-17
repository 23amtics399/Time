import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { convert12To24, convert24To12, pad } from '../../utils/time';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
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
  const [searchParams] = useSearchParams();

  // 12-hour state
  const [h12, setH12] = useState('08');
  const [m12, setM12] = useState('30');
  const [ampm, setAmpm] = useState('AM');

  // 24-hour state
  const [time24Input, setTime24Input] = useState('20:45');

  useEffect(() => {
    const qTime = searchParams.get('time');
    if (qTime && /^\d{1,2}:\d{2}$/.test(qTime)) {
      setTime24Input(qTime);
      const [h, m] = qTime.split(':').map(Number);
      if (h < 12) {
        setH12(String(h === 0 ? 12 : h).padStart(2, '0'));
        setM12(String(m).padStart(2, '0'));
        setAmpm('AM');
      } else {
        setH12(String(h === 12 ? 12 : h - 12).padStart(2, '0'));
        setM12(String(m).padStart(2, '0'));
        setAmpm('PM');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Converted results
  const resFrom12 = convert12To24(h12, m12, ampm);

  const [h24Part, m24Part] = time24Input.split(':').map(Number);
  const resFrom24 = !isNaN(h24Part) && !isNaN(m24Part) ? convert24To12(h24Part, m24Part) : null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/military-time-converter?time=${encodeURIComponent(time24Input)}`
    : `https://time.sji.one/military-time-converter?time=${encodeURIComponent(time24Input)}`;

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
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <CopyButton
                    text={`${resFrom12.militaryTime} (${resFrom12.time24})`}
                    label="Copy military time"
                    ariaLabel="Copy military time"
                  />
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
                aria-label="24-Hour Input"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const now = new Date();
                  setTime24Input(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                }}
              >
                Now
              </button>
            </div>

            {resFrom24 && (
              <div className="mtc-display-box">
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">Standard 12-Hour</span>
                  <div className="mtc-display-val" style={{ color: 'var(--accent)' }}>{resFrom24.time12}</div>
                </div>
                <div>
                  <span className="text-xs text-muted uppercase font-semibold">Military Time</span>
                  <div className="mtc-display-val">{resFrom24.military} hours</div>
                </div>
                <div className="mtc-phonetic">
                  Spoken: &ldquo;{resFrom24.pronunciation}&rdquo;
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <ShareButton
                    url={shareUrl}
                    title="Military Time Conversion"
                    text={`${time24Input} in military time is ${resFrom24.military} hours (${resFrom24.time12})`}
                  />
                  <CopyButton
                    text={`${resFrom24.time12} (${resFrom24.military} hours)`}
                    label="Copy 12-hour"
                    ariaLabel="Copy 12-hour time"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reference 24h Table */}
        <div className="card mtc-table-card">
          <h2 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>Military Time Reference Chart</h2>
          <div className="mtc-table-wrap">
            <table className="mtc-table">
              <thead>
                <tr>
                  <th>12-Hour Standard</th>
                  <th>24-Hour Format</th>
                  <th>Military Time</th>
                  <th>Pronunciation Guide</th>
                </tr>
              </thead>
              <tbody>
                {REFERENCE_HOURS.map(row => (
                  <tr key={row.h24}>
                    <td>{row.time12}</td>
                    <td className="font-mono">{row.time24}</td>
                    <td className="font-mono font-semibold" style={{ color: 'var(--accent)' }}>{row.military}</td>
                    <td className="text-muted text-sm">{row.pronunciation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {ROUTES_SEO['/military-time-converter']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/military-time-converter'].guide} toolName="Military Time Converter" />
        )}
      </div>
    </>
  );
}
