import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { TIMEZONES } from '../../data/timezones';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { detectTimezoneDST } from '../../utils/time';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
import './DSTChecker.css';

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export default function DSTChecker() {
  const [searchParams] = useSearchParams();
  const [timezone, setTimezone] = useLocalStorage('dst-tz', 'America/New_York');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const qTz = searchParams.get('tz');
    const qYear = parseInt(searchParams.get('year'), 10);
    if (qTz && TIMEZONES.some(t => t.value === qTz)) {
      setTimezone(qTz);
    }
    if (!isNaN(qYear) && YEARS.includes(qYear)) {
      setYear(qYear);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dstData = detectTimezoneDST(timezone, year);
  const tzObj = TIMEZONES.find(t => t.value === timezone);
  const tzLabel = tzObj ? tzObj.label : timezone;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dst-checker?tz=${encodeURIComponent(timezone)}&year=${year}`
    : `https://time.sji.one/dst-checker?tz=${encodeURIComponent(timezone)}&year=${year}`;

  const copySummaryText = useMemo(() => {
    if (!dstData) return '';
    return `${tzLabel} (${year}):\nStatus: ${dstData.observesDST ? 'Observes DST' : 'No DST'}\nCurrent Offset: ${dstData.currentOffset}\nNext Transition: ${dstData.nextTransition ? `${dstData.nextTransition.direction} on ${dstData.nextTransition.formattedDate}` : 'None'}`;
  }, [dstData, tzLabel, year]);

  return (
    <>
      <SEO path="/dst-checker" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Daylight Saving Time (DST) Explorer</h1>
          <p>Inspect whether any timezone observes Daylight Saving Time, view upcoming clock changes, and inspect annual transition schedules.</p>
        </div>

        <div className="card dst-header-card">
          <div className="dst-tz-row">
            <div className="dst-tz-select-group">
              <label className="field-label" htmlFor="dst-tz-select">Select Timezone</label>
              <select
                id="dst-tz-select"
                className="select"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            <div className="dst-year-select-group">
              <label className="field-label" htmlFor="dst-year-select">Calendar Year</label>
              <select
                id="dst-year-select"
                className="select"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem', marginBottom: '2px' }}>
              <ShareButton
                url={shareUrl}
                title={`DST Status for ${tzLabel}`}
                text={`Check Daylight Saving Time information for ${tzLabel} in ${year}`}
              />
              <CopyButton
                text={copySummaryText}
                label="Copy status"
                ariaLabel="Copy DST status summary"
              />
            </div>
          </div>

          <div className={`dst-status-banner ${dstData.observesDST ? 'dst-status-banner--active' : 'dst-status-banner--none'}`}>
            <div>
              <div className="dst-status-title">
                {dstData.observesDST ? 'Observes Daylight Saving Time' : 'No Daylight Saving Time Observed'}
              </div>
              <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                {dstData.observesDST
                  ? `Time shifts occur during ${year} between standard time and daylight saving time.`
                  : `Clocks remain on a permanent fixed offset year-round in this region.`}
              </div>
            </div>
            <span className="badge" style={{ background: dstData.observesDST ? 'var(--success)' : 'var(--bg-card)', color: dstData.observesDST ? '#fff' : 'var(--text-muted)' }}>
              {dstData.observesDST ? 'Seasonal Shift' : 'Fixed UTC Offset'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="dst-details-grid">
          <div className="card dst-detail-card">
            <span className="text-xs text-muted font-semibold uppercase">Current UTC Offset</span>
            <span className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{dstData.currentOffset}</span>
            <span className="text-xs text-muted">Active offset right now</span>
          </div>

          <div className="card dst-detail-card">
            <span className="text-xs text-muted font-semibold uppercase">Distinct Offsets in {year}</span>
            <span className="text-2xl font-bold font-mono">{dstData.uniqueOffsets.join(' / ')}</span>
            <span className="text-xs text-muted">{dstData.uniqueOffsets.length} detected state{dstData.uniqueOffsets.length > 1 ? 's' : ''}</span>
          </div>

          <div className="card dst-detail-card">
            <span className="text-xs text-muted font-semibold uppercase">Next Detected Transition</span>
            {dstData.nextTransition ? (
              <>
                <span className="text-lg font-bold" style={{ color: 'var(--success)' }}>{dstData.nextTransition.direction}</span>
                <span className="text-xs text-muted">{dstData.nextTransition.formattedDate} ({dstData.nextTransition.fromOffset} → {dstData.nextTransition.toOffset})</span>
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-muted">None Detected</span>
                <span className="text-xs text-muted">No upcoming clock change detected</span>
              </>
            )}
          </div>
        </div>

        {/* Transition Table */}
        {dstData.transitionsInYear.length > 0 && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 className="text-base font-semibold">Detected Transitions in {year}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="dst-transition-table" aria-label="Daylight saving transitions">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Change Description</th>
                    <th>Shift</th>
                    <th>Resulting Offset</th>
                  </tr>
                </thead>
                <tbody>
                  {dstData.transitionsInYear.map((t, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{t.formattedDate}</td>
                      <td>{t.direction}</td>
                      <td className="font-mono text-muted">{t.fromOffset} → {t.toOffset}</td>
                      <td className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{t.toOffset}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ROUTES_SEO['/dst-checker']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/dst-checker'].guide} toolName="Daylight Saving Time (DST) Explorer" />
        )}
      </div>
    </>
  );
}
