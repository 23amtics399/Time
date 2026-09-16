import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { getISOWeekDetails, toDateInput } from '../../utils/time';
import './WeekNumber.css';

export default function WeekNumber() {
  const today = new Date();
  const todayDetails = getISOWeekDetails(today);

  const [lookupDateStr, setLookupDateStr] = useState(toDateInput(today));
  const lookupDetails = lookupDateStr ? getISOWeekDetails(new Date(lookupDateStr)) : null;

  return (
    <>
      <SEO path="/week-number" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Week Number &amp; Day of Year Calculator</h1>
          <p>Find the current ISO 8601 week number, day of the year, annual progress, or look up calendar metrics for any date.</p>
        </div>

        {/* Current Metrics Hero */}
        {todayDetails && (
          <div className="wn-hero-grid">
            <div className="card wn-hero-card">
              <span className="text-xs font-semibold text-muted uppercase">Current ISO Week</span>
              <div className="wn-hero-num">Week {todayDetails.weekNumber}</div>
              <span className="text-sm text-muted">ISO Week Date: <strong>{todayDetails.isoWeekDate}</strong></span>
              <span className="text-xs text-muted">
                {todayDetails.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {todayDetails.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="card wn-hero-card">
              <span className="text-xs font-semibold text-muted uppercase">Year Progress ({today.getFullYear()})</span>
              <div className="wn-hero-num" style={{ color: 'var(--success)' }}>{todayDetails.yearProgress}%</div>
              <div className="wn-progress-wrap">
                <div className="wn-progress-bar-bg">
                  <div className="wn-progress-bar-fill" style={{ width: `${todayDetails.yearProgress}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                Day {todayDetails.dayOfYear} of {todayDetails.daysInYear} ({todayDetails.daysRemaining} days remaining)
              </span>
            </div>
          </div>
        )}

        {/* Additional metrics */}
        {todayDetails && (
          <div className="wn-metrics-grid">
            <div className="card wn-metric-card">
              <span className="text-xs text-muted font-semibold uppercase">Quarter</span>
              <span className="text-2xl font-bold font-mono">Q{todayDetails.quarter}</span>
              <span className="text-xs text-muted">{today.getFullYear()}</span>
            </div>

            <div className="card wn-metric-card">
              <span className="text-xs text-muted font-semibold uppercase">Day of Year</span>
              <span className="text-2xl font-bold font-mono">{todayDetails.dayOfYear}</span>
              <span className="text-xs text-muted">of {todayDetails.daysInYear}</span>
            </div>

            <div className="card wn-metric-card">
              <span className="text-xs text-muted font-semibold uppercase">Days Remaining</span>
              <span className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{todayDetails.daysRemaining}</span>
              <span className="text-xs text-muted">in {today.getFullYear()}</span>
            </div>

            <div className="card wn-metric-card">
              <span className="text-xs text-muted font-semibold uppercase">Leap Year</span>
              <span className="text-2xl font-bold font-mono">{todayDetails.isLeapYear ? 'Yes' : 'No'}</span>
              <span className="text-xs text-muted">{todayDetails.daysInYear} days</span>
            </div>
          </div>
        )}

        {/* Date Lookup */}
        <div className="card wn-lookup-card">
          <h2 className="text-base font-semibold">Look Up Week Number for Any Date</h2>
          <p className="text-sm text-muted">Select any past or future calendar date to calculate its exact ISO 8601 week number and day statistics.</p>

          <div className="wn-lookup-row">
            <div>
              <label className="field-label" htmlFor="wn-date-input">Select Date</label>
              <input
                id="wn-date-input"
                type="date"
                className="input"
                value={lookupDateStr}
                onChange={e => setLookupDateStr(e.target.value)}
              />
            </div>
          </div>

          {lookupDetails && (
            <div className="wn-metrics-grid" style={{ marginTop: '1.25rem', marginBottom: '0' }}>
              <div className="card wn-metric-card" style={{ background: 'var(--bg-hover)' }}>
                <span className="text-xs text-muted font-semibold uppercase">ISO Week Number</span>
                <span className="text-xl font-bold font-mono" style={{ color: 'var(--accent)' }}>Week {lookupDetails.weekNumber}</span>
                <span className="text-xs text-muted">Year {lookupDetails.isoYear}</span>
              </div>

              <div className="card wn-metric-card" style={{ background: 'var(--bg-hover)' }}>
                <span className="text-xs text-muted font-semibold uppercase">Week Span</span>
                <span className="text-sm font-semibold">
                  {lookupDetails.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {lookupDetails.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs text-muted">Mon to Sun</span>
              </div>

              <div className="card wn-metric-card" style={{ background: 'var(--bg-hover)' }}>
                <span className="text-xs text-muted font-semibold uppercase">Quarter</span>
                <span className="text-xl font-bold font-mono">Q{lookupDetails.quarter}</span>
                <span className="text-xs text-muted">Day {lookupDetails.dayOfYear} of {lookupDetails.daysInYear}</span>
              </div>

              <div className="card wn-metric-card" style={{ background: 'var(--bg-hover)' }}>
                <span className="text-xs text-muted font-semibold uppercase">ISO Week Date</span>
                <span className="text-sm font-mono font-bold">{lookupDetails.isoWeekDate}</span>
                <span className="text-xs text-muted">Day {lookupDetails.isoDay} of week</span>
              </div>
            </div>
          )}
        </div>

        {ROUTES_SEO['/week-number']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/week-number'].guide} toolName="Week Number & Day of Year Calculator" />
        )}
      </div>
    </>
  );
}
