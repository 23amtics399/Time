import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { calculateWorkingHours, toDatetimeLocal } from '../../utils/time';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
import './WorkingHours.css';

const DAYS_MAP = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export default function WorkingHours() {
  const [searchParams] = useSearchParams();

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setHours(9, 0, 0, 0);

  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 5);
  defaultEnd.setHours(17, 0, 0, 0);

  const [start, setStart] = useState(toDatetimeLocal(defaultStart));
  const [end, setEnd] = useState(toDatetimeLocal(defaultEnd));

  const [workStart, setWorkStart] = useLocalStorage('wh-start', '09:00');
  const [workEnd, setWorkEnd] = useLocalStorage('wh-end', '17:00');
  const [breakMinutes, setBreakMinutes] = useLocalStorage('wh-break', 60);
  const [workDays, setWorkDays] = useLocalStorage('wh-days', [1, 2, 3, 4, 5]);

  useEffect(() => {
    const qStart = searchParams.get('start');
    const qEnd = searchParams.get('end');
    const qWStart = searchParams.get('shiftStart');
    const qWEnd = searchParams.get('shiftEnd');
    if (qStart) setStart(qStart);
    if (qEnd) setEnd(qEnd);
    if (qWStart) setWorkStart(qWStart);
    if (qWEnd) setWorkEnd(qWEnd);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDay(dayId) {
    if (workDays.includes(dayId)) {
      if (workDays.length > 1) {
        setWorkDays(workDays.filter(d => d !== dayId));
      }
    } else {
      setWorkDays([...workDays, dayId]);
    }
  }

  const results = calculateWorkingHours({
    start,
    end,
    workStart,
    workEnd,
    workDays,
    breakMinutes: Number(breakMinutes) || 0,
  });

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/working-hours?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&shiftStart=${encodeURIComponent(workStart)}&shiftEnd=${encodeURIComponent(workEnd)}`
    : `https://time.sji.one/working-hours?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  const copyResultText = useMemo(() => {
    if (!results || results.error) return '';
    return `Working Hours Calculation (${start} to ${end}):\nNet Work Hours: ${results.workHours}h ${results.workMinutesRem}m (${results.workHoursDecimal}h)\nBusiness Days: ${results.workDaysActive} days\nTotal Elapsed: ${results.totalCalendarHours}h`;
  }, [results, start, end]);

  return (
    <>
      <SEO path="/working-hours" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Working Hours &amp; Business Days Calculator</h1>
          <p>Calculate exact net working hours and business days between dates, excluding weekends and off-shift hours.</p>
        </div>

        <div className="card wh-form">
          <div className="wh-dates-grid">
            <div>
              <label className="field-label" htmlFor="wh-start-input">Start date &amp; time</label>
              <input
                id="wh-start-input"
                type="datetime-local"
                className="input"
                value={start}
                onChange={e => setStart(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="wh-end-input">End date &amp; time</label>
              <input
                id="wh-end-input"
                type="datetime-local"
                className="input"
                value={end}
                onChange={e => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="wh-settings-box">
            <h2 className="text-sm font-semibold uppercase text-muted">Work Schedule Settings</h2>
            <div className="wh-settings-grid">
              <div>
                <label className="field-label" htmlFor="wh-shift-start">Workday Start</label>
                <input
                  id="wh-shift-start"
                  type="time"
                  className="input"
                  value={workStart}
                  onChange={e => setWorkStart(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="wh-shift-end">Workday End</label>
                <input
                  id="wh-shift-end"
                  type="time"
                  className="input"
                  value={workEnd}
                  onChange={e => setWorkEnd(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="wh-break-mins">Daily Unpaid Break (mins)</label>
                <input
                  id="wh-break-mins"
                  type="number"
                  min="0"
                  max="240"
                  className="input"
                  value={breakMinutes}
                  onChange={e => setBreakMinutes(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <span className="field-label">Active Working Days</span>
              <div className="wh-days-row" role="group" aria-label="Working days of week">
                {DAYS_MAP.map(d => {
                  const isActive = workDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={`wh-day-btn ${isActive ? 'wh-day-btn--active' : ''}`}
                      onClick={() => toggleDay(d.id)}
                      aria-pressed={isActive}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <ShareButton
              url={shareUrl}
              title="Working Hours Calculation"
              text={`Working hours from ${start} to ${end}`}
            />
            {results && !results.error && (
              <CopyButton
                text={copyResultText}
                label="Copy hours"
                ariaLabel="Copy working hours result"
              />
            )}
          </div>
        </div>

        {results && !results.error && (
          <div className="wh-results-grid" aria-label="Calculation results">
            <div className="card wh-result-card">
              <span className="wh-metric-label">Net Working Hours</span>
              <span className="wh-metric-val">{results.workHours}h {results.workMinutesRem}m</span>
              <span className="text-xs text-muted">({results.workHoursDecimal} decimal hours)</span>
            </div>

            <div className="card wh-result-card">
              <span className="wh-metric-label">Full-Time Working Days</span>
              <span className="wh-metric-val" style={{ color: 'var(--success)' }}>{results.workDaysActive} days</span>
              <span className="text-xs text-muted">({results.standard8hDays} std 8-hr shifts)</span>
            </div>

            <div className="card wh-result-card">
              <span className="wh-metric-label">Total Calendar Elapsed</span>
              <span className="wh-metric-val" style={{ color: 'var(--text-primary)' }}>{results.totalCalendarHours}h</span>
              <span className="text-xs text-muted">24/7 calendar interval</span>
            </div>

            <div className="card wh-result-card">
              <span className="wh-metric-label">Excluded Off &amp; Weekend Time</span>
              <span className="wh-metric-val" style={{ color: 'var(--warning)' }}>{results.excludedHours}h</span>
              <span className="text-xs text-muted">{results.nonWorkDays} non-working days</span>
            </div>
          </div>
        )}

        {ROUTES_SEO['/working-hours']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/working-hours'].guide} toolName="Working Hours & Business Days Calculator" />
        )}
      </div>
    </>
  );
}
