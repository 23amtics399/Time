import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { calculateSleepSchedules, DEFAULT_SLEEP_LATENCY_MINS, pad } from '../../utils/time';
import './SleepTimePlanner.css';

export default function SleepTimePlanner() {
  const [mode, setMode] = useState('wakeAt'); // 'wakeAt' | 'sleepAt' | 'sleepNow'
  const [targetTime, setTargetTime] = useLocalStorage('stp-target-time', '07:00');
  const [latency, setLatency] = useLocalStorage('stp-latency', DEFAULT_SLEEP_LATENCY_MINS);

  const plan = calculateSleepSchedules({
    targetTime,
    mode,
    latencyMinutes: Number(latency) || DEFAULT_SLEEP_LATENCY_MINS,
  });

  function formatDisplayTime(date) {
    let h = date.getHours();
    const m = pad(date.getMinutes());
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  return (
    <>
      <SEO path="/sleep-time" />

      <div className="tool-page">
        <div className="tool-header">
          <h1>Sleep &amp; Wake Time Planner</h1>
          <p>Plan approximate sleep schedules based on standard 90-minute intervals and fall-asleep latency.</p>
        </div>

        {/* Mode Selector */}
        <div className="stp-mode-toggles" role="tablist" aria-label="Sleep calculation mode">
          <button
            className={`btn ${mode === 'wakeAt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('wakeAt')}
            role="tab"
            aria-selected={mode === 'wakeAt'}
          >
            I want to wake up at...
          </button>
          <button
            className={`btn ${mode === 'sleepNow' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('sleepNow')}
            role="tab"
            aria-selected={mode === 'sleepNow'}
          >
            I&apos;m going to bed now
          </button>
          <button
            className={`btn ${mode === 'sleepAt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('sleepAt')}
            role="tab"
            aria-selected={mode === 'sleepAt'}
          >
            I&apos;m going to bed at...
          </button>
        </div>

        {/* Input Form */}
        <div className="card stp-form-card">
          <div className="stp-input-row">
            {mode !== 'sleepNow' && (
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label className="field-label" htmlFor="stp-target-time">
                  {mode === 'wakeAt' ? 'Target Wake-Up Time' : 'Planned Bedtime'}
                </label>
                <input
                  id="stp-target-time"
                  type="time"
                  className="input"
                  value={targetTime}
                  onChange={e => setTargetTime(e.target.value)}
                />
              </div>
            )}

            <div style={{ flex: 1, minWidth: '180px' }}>
              <label className="field-label" htmlFor="stp-latency-input">
                Fall-Asleep Latency (minutes)
              </label>
              <input
                id="stp-latency-input"
                type="number"
                min="0"
                max="60"
                className="input"
                value={latency}
                onChange={e => setLatency(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="stp-disclaimer">
          <strong>Important Disclaimer:</strong> These are approximate time-planning calculations, not medical advice. Individual sleep needs and sleep-cycle lengths vary.
        </div>

        {/* Results Schedules */}
        <h2 className="text-base font-semibold" style={{ marginBottom: '1rem' }}>
          {mode === 'wakeAt' ? 'Suggested Bedtimes' : 'Suggested Wake Times'}
        </h2>

        <div className="stp-schedules-grid">
          {plan.schedules.map(item => (
            <div
              key={item.cycles}
              className={`card stp-cycle-card ${item.isRecommended ? 'stp-cycle-card--rec' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-xs font-semibold text-muted uppercase">{item.label}</span>
                {item.isRecommended && (
                  <span className="badge" style={{ background: 'var(--success)', color: '#fff' }}>Recommended</span>
                )}
              </div>

              <div className="stp-time-display">{formatDisplayTime(item.time)}</div>
              <div className="text-xs text-muted">{item.description}</div>

              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/alarm" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Set an Alarm
                </Link>
              </div>
            </div>
          ))}
        </div>

        {ROUTES_SEO['/sleep-time']?.guide && (
          <ToolGuide guide={ROUTES_SEO['/sleep-time'].guide} toolName="Sleep & Wake Time Planner" />
        )}
      </div>
    </>
  );
}
