import { useState, useRef, useCallback, useEffect } from 'react';
import SEO from '../../components/SEO';
import { useTimerContext } from '../../contexts/TimerContext';
import EditableTimeDisplay from '../../components/EditableTimeDisplay';
import { playTestSound, warmupAudio } from '../../utils/audio';
import './Countdown.css';

const PRESETS = [
  { label: '1 min',  seconds: 60 },
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '25 min', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
];

export default function Countdown() {
  const { countdown, setCountdown } = useTimerContext();
  const {
    targetTimestamp,
    remainingMs,
    configuredDurationMs,
    isRunning,
    isFinished,
    sound,
  } = countdown;

  const currentDisplayMs = isRunning && targetTimestamp
    ? Math.max(0, targetTimestamp - Date.now())
    : remainingMs;

  const [renderMs, setRenderMs] = useState(currentDisplayMs);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    if (!isRunning || !targetTimestamp) return;
    const rem = targetTimestamp - Date.now();
    if (rem <= 0) {
      setRenderMs(0);
      return;
    }
    setRenderMs(rem);
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, targetTimestamp]);

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setRenderMs(remainingMs);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, remainingMs, tick]);

  function applyPreset(sec) {
    warmupAudio();
    const ms = sec * 1000;
    setCountdown(c => ({
      ...c,
      configuredDurationMs: ms,
      remainingMs: ms,
      isRunning: false,
      isFinished: false,
      targetTimestamp: null,
    }));
  }

  function handleEditComplete(newTotalSeconds) {
    if (newTotalSeconds <= 0) return;
    const ms = newTotalSeconds * 1000;
    setCountdown(c => ({
      ...c,
      configuredDurationMs: ms,
      remainingMs: ms,
      isRunning: false,
      isFinished: false,
      targetTimestamp: null,
    }));
  }

  function start() {
    warmupAudio();
    const ms = remainingMs > 0 ? remainingMs : configuredDurationMs;
    if (ms <= 0) return;
    setCountdown(c => ({
      ...c,
      remainingMs: ms,
      isRunning: true,
      isFinished: false,
      targetTimestamp: Date.now() + ms,
    }));
  }

  function pause() {
    setCountdown(c => ({
      ...c,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: Math.max(0, c.targetTimestamp - Date.now()),
    }));
  }

  function stop() {
    setCountdown(c => ({
      ...c,
      isRunning: false,
      isFinished: false,
      targetTimestamp: null,
      remainingMs: c.configuredDurationMs,
    }));
  }

  const configuredSecs = (configuredDurationMs || 0) / 1000;
  const progress = configuredDurationMs > 0 ? 1 - renderMs / configuredDurationMs : 0;
  const displaySecs = Math.ceil(renderMs / 1000);
  const isAtFull = renderMs >= (configuredDurationMs - 500);

  return (
    <>
      <SEO
        title="Countdown Timer"
        description="Set a countdown timer with quick presets or a custom duration. Audio alert when time's up."
        path="/countdown"
      />

      <div className="tool-page cd-page">
        <div className="tool-header">
          <h1>Countdown Timer</h1>
          <p>Set a duration and get an alert when time is up.</p>
        </div>

        {/* Progress ring + display */}
        <div className="cd-visual">
          <svg className="cd-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="88" className="cd-ring-bg" />
            <circle
              cx="100" cy="100" r="88"
              className="cd-ring-progress"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress)}`}
            />
          </svg>
          <div className="cd-display" role="timer" aria-live="polite" aria-label="Time remaining">
            <EditableTimeDisplay
              totalSeconds={displaySecs}
              showHours={displaySecs >= 3600}
              onComplete={handleEditComplete}
              disabled={isRunning}
              className={isFinished ? 'cd-done' : ''}
            />
            {isFinished && <span className="cd-done-label">Time's up!</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="cd-controls">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={start} disabled={configuredDurationMs <= 0}>
              {!isFinished && renderMs < configuredDurationMs && renderMs > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={pause}>Pause</button>
          )}
          <button className="btn btn-secondary btn-lg" onClick={stop}>Reset</button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-secondary ${sound ? '' : 'cd-muted'}`}
              onClick={() => { warmupAudio(); setCountdown(c => ({ ...c, sound: !c.sound })); }}
              aria-label={sound ? 'Mute sound' : 'Unmute sound'}
              title={sound ? 'Sound on' : 'Sound off'}
            >
              {sound ? <SoundOnIcon /> : <SoundOffIcon />}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { warmupAudio(); playTestSound(); }}
              aria-label="Test sound"
              title="Test sound"
            >
              🎵
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="card cd-presets">
          <p className="field-label">Quick Presets</p>
          <div className="cd-preset-grid">
            {PRESETS.map(p => (
              <button
                key={p.seconds}
                className={`btn btn-secondary cd-preset-btn ${configuredDurationMs === p.seconds * 1000 && isAtFull ? 'cd-preset-active' : ''}`}
                onClick={() => applyPreset(p.seconds)}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SoundOnIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 6H2v6h2l4 4V2L4 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 5.5a4 4 0 010 7M14.5 3a7 7 0 010 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function SoundOffIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 6H2v6h2l4 4V2L4 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 7l3 4M16 7l-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
