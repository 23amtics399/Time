import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { dateDiff, pad } from '../../utils/time';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
import './DateCountdown.css';

function getNextAnnualDate(month, day) {
  const now = new Date();
  const year = now.getFullYear();
  const target = new Date(year, month, day);
  if (target.getTime() < now.getTime()) {
    target.setFullYear(year + 1);
  }
  return target;
}

const PRESETS = [
  { label: 'New Year',     getDate: () => getNextAnnualDate(0, 1) },
  { label: 'Valentine\'s', getDate: () => getNextAnnualDate(1, 14) },
  { label: 'Halloween',    getDate: () => getNextAnnualDate(9, 31) },
  { label: 'Christmas',    getDate: () => getNextAnnualDate(11, 25) },
];

function toDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DateCountdown() {
  const [searchParams] = useSearchParams();
  const [targetDate, setTargetDate] = useLocalStorage('date-countdown-target', toDateInput(new Date(new Date().getFullYear() + 1, 0, 1)));
  const [eventName,  setEventName]  = useLocalStorage('date-countdown-name', 'New Year');
  const now = useNow(true, 'second');

  // Read URL query params on mount
  useEffect(() => {
    const qDate = searchParams.get('date');
    const qName = searchParams.get('name');
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      setTargetDate(qDate);
    }
    if (qName) {
      setEventName(qName);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const target = new Date(targetDate + 'T00:00:00');
  const diff = dateDiff(now, target);
  const isPast = diff.sign < 0;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/date-countdown?date=${targetDate}&name=${encodeURIComponent(eventName)}`
    : `https://time.sji.one/date-countdown?date=${targetDate}&name=${encodeURIComponent(eventName)}`;

  const copyText = useMemo(() => {
    if (isPast) return `${eventName} on ${targetDate} has already passed.`;
    return `Countdown to ${eventName}: ${diff.days} days, ${diff.hours} hours, ${diff.minutes} minutes, ${diff.seconds} seconds`;
  }, [eventName, targetDate, isPast, diff]);

  return (
    <>
      <SEO path="/date-countdown" />

      <div className="tool-page dcd-page">
        <div className="tool-header" style={{ textAlign: 'center' }}>
          <h1>Date Countdown</h1>
          <p>Countdown to any date — events, deadlines, birthdays.</p>
        </div>

        {/* Countdown display */}
        <div className="card dcd-display">
          {eventName && <p className="dcd-event-name">{eventName}</p>}
          {isPast ? (
            <p className="dcd-past text-muted">This date has passed.</p>
          ) : (
            <div className="dcd-units" role="timer" aria-live="polite" aria-label={`Countdown to ${eventName}`}>
              <div className="dcd-unit">
                <span className="dcd-val font-mono">{pad(diff.days, 3)}</span>
                <span className="dcd-unit-label">days</span>
              </div>
              <span className="dcd-sep" aria-hidden="true">:</span>
              <div className="dcd-unit">
                <span className="dcd-val font-mono">{pad(diff.hours)}</span>
                <span className="dcd-unit-label">hours</span>
              </div>
              <span className="dcd-sep" aria-hidden="true">:</span>
              <div className="dcd-unit">
                <span className="dcd-val font-mono">{pad(diff.minutes)}</span>
                <span className="dcd-unit-label">min</span>
              </div>
              <span className="dcd-sep" aria-hidden="true">:</span>
              <div className="dcd-unit">
                <span className="dcd-val font-mono">{pad(diff.seconds)}</span>
                <span className="dcd-unit-label">sec</span>
              </div>
            </div>
          )}
          <p className="dcd-target-date text-muted text-sm">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(target)}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <ShareButton
              url={shareUrl}
              title={`Countdown to ${eventName}`}
              text={`Countdown to ${eventName}: ${diff.days} days remaining!`}
            />
            <CopyButton
              text={copyText}
              label="Copy countdown"
              ariaLabel="Copy countdown text"
            />
          </div>
        </div>

        {/* Configure */}
        <div className="card dcd-config">
          <div className="dcd-config-row">
            <div style={{ flex: 2 }}>
              <label className="field-label" htmlFor="dcd-name">Event name</label>
              <input id="dcd-name" className="input" type="text" placeholder="e.g. New Year"
                value={eventName} onChange={e => setEventName(e.target.value)} maxLength={60} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="dcd-date">Target date</label>
              <input id="dcd-date" className="input" type="date" value={targetDate}
                onChange={e => setTargetDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="card dcd-presets">
          <p className="field-label" style={{ marginBottom: '0.75rem' }}>Quick Presets</p>
          <div className="dcd-preset-grid">
            {PRESETS.map(p => (
              <button key={p.label} type="button" className="btn btn-secondary"
                onClick={() => {
                  setEventName(p.label);
                  setTargetDate(toDateInput(p.getDate()));
                }}
              >{p.label}</button>
            ))}
          </div>
        </div>

        <ToolGuide guide={ROUTES_SEO['/date-countdown'].guide} toolName="Date Countdown" />
      </div>
    </>
  );
}
