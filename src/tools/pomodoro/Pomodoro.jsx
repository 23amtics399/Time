import { useState, useRef, useCallback, useEffect } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTimerContext } from '../../contexts/TimerContext';
import EditableTimeDisplay from '../../components/EditableTimeDisplay';
import { playTestSound, warmupAudio } from '../../utils/audio';
import './Pomodoro.css';

const PHASES = ['work', 'short', 'long'];
const PHASE_LABEL = { work: 'Focus', short: 'Short Break', long: 'Long Break' };
const PHASE_COLOR = { work: 'var(--accent)', short: 'var(--success)', long: 'hsl(210,85%,60%)' };

const BUILTIN_PRESETS = [
  { id: 'standard', name: 'Standard', workMins: 25, shortMins: 5, longMins: 15, longAfter: 4 },
  { id: 'power_nap', name: 'Power Nap', workMins: 20, shortMins: 0, longMins: 0, longAfter: 1 },
  { id: 'deep_work', name: 'Deep Work', workMins: 50, shortMins: 10, longMins: 30, longAfter: 4 },
  { id: 'study', name: 'Study', workMins: 45, shortMins: 15, longMins: 30, longAfter: 3 }
];

export default function Pomodoro() {
  const { pomodoro, setPomodoro } = useTimerContext();
  const [presets, setPresets] = useLocalStorage('pomodoro-custom-presets', BUILTIN_PRESETS);
  
  const { targetTimestamp, remainingMs, phase, sessions, isRunning, sound, settings } = pomodoro;

  function phaseDurationMs(p = phase) {
    if (p === 'work')  return settings.workMins  * 60 * 1000;
    if (p === 'short') return settings.shortMins * 60 * 1000;
    return settings.longMins * 60 * 1000;
  }

  const currentDisplayMs = isRunning && targetTimestamp ? Math.max(0, targetTimestamp - Date.now()) : remainingMs;
  const [renderMs, setRenderMs] = useState(currentDisplayMs);
  const rafRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  const tick = useCallback(() => {
    if (!isRunning || !targetTimestamp) return;
    const rem = targetTimestamp - Date.now();
    if (rem <= 0) {
      setRenderMs(0);
      return; // Handled by context
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

  function start() {
    warmupAudio();
    const totalMs = phaseDurationMs(phase);
    
    if (remainingMs <= 0 && totalMs > 0) {
      setPomodoro(p => ({
        ...p,
        remainingMs: totalMs,
        isRunning: true,
        targetTimestamp: Date.now() + totalMs
      }));
      return;
    }
    if (remainingMs <= 0) return;
    
    setPomodoro(p => ({
      ...p,
      isRunning: true,
      targetTimestamp: Date.now() + p.remainingMs
    }));
  }

  function pause() {
    setPomodoro(p => ({ 
      ...p, 
      isRunning: false, 
      targetTimestamp: null,
      remainingMs: Math.max(0, p.targetTimestamp - Date.now())
    }));
  }

  function reset() {
    setPomodoro(p => ({
      ...p,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: phaseDurationMs(p.phase),
      sessions: 0
    }));
  }

  function skipPhase() {
    setPomodoro(p => {
      let nextPhase = 'work';
      let nextSessions = p.sessions;
      if (p.phase === 'work') {
        nextSessions += 1;
        nextPhase = nextSessions % p.settings.longAfter === 0 ? 'long' : 'short';
      }
      return {
        ...p,
        isRunning: false,
        targetTimestamp: null,
        remainingMs: phaseDurationMs(nextPhase),
        phase: nextPhase,
        sessions: nextSessions
      };
    });
  }

  function applyPreset(preset) {
    setPomodoro(p => ({
      ...p,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: preset.workMins * 60 * 1000,
      phase: 'work',
      sessions: 0,
      settings: {
        workMins: preset.workMins,
        shortMins: preset.shortMins,
        longMins: preset.longMins,
        longAfter: preset.longAfter
      }
    }));
  }

  function updateSetting(key, value) {
    const n = parseInt(value);
    if (isNaN(n) || n < 1) return;
    
    // Changing setting might alter the phase duration, but if user is paused, we probably want to update remainingMs if they were at full.
    // simpler: just update settings, TimerContext handles remaining changes if any, or reset does.
    setPomodoro(p => ({
      ...p,
      settings: { ...p.settings, [key]: n }
    }));
  }
  
  function handleEditComplete(newTotalSeconds) {
    // Determine which setting we are updating based on current phase
    const newMins = Math.max(1, Math.floor(newTotalSeconds / 60));
    const key = phase === 'work' ? 'workMins' : phase === 'short' ? 'shortMins' : 'longMins';
    updateSetting(key, newMins);
    setPomodoro(p => ({
      ...p,
      remainingMs: newTotalSeconds * 1000
    }));
  }

  const totalMs = phaseDurationMs(phase);
  const progress = totalMs > 0 ? 1 - renderMs / totalMs : 0;
  const displaySecs = Math.ceil(renderMs / 1000);

  const dots = Array.from({ length: settings.longAfter || 1 }, (_, i) => i < (sessions % (settings.longAfter || 1)));

  return (
    <>
      <SEO path="/pomodoro" />

      <div className="tool-page pom-page">
        <div className="tool-header" style={{ textAlign: 'center' }}>
          <h1>Pomodoro Timer</h1>
          <p>Focus in intervals. Rest intentionally.</p>
        </div>

        {/* Phase tabs */}
        <div className="pom-phases" role="tablist">
          {PHASES.map(p => (
            <button
              key={p}
              role="tab"
              aria-selected={phase === p}
              className={`pom-phase-btn ${phase === p ? 'pom-phase-active' : ''}`}
              style={phase === p ? { '--phase-color': PHASE_COLOR[p] } : {}}
              onClick={() => {
                if (isRunning) return;
                setPomodoro(prev => {
                  const dur =
                    p === 'work'  ? prev.settings.workMins  * 60 * 1000 :
                    p === 'short' ? prev.settings.shortMins * 60 * 1000 :
                                    prev.settings.longMins  * 60 * 1000;
                  return { ...prev, phase: p, targetTimestamp: null, remainingMs: dur };
                });
              }}
            >
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Ring + display */}
        <div className="pom-visual">
          <svg className="pom-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="88" className="pom-ring-bg" />
            <circle
              cx="100" cy="100" r="88"
              className="pom-ring-progress"
              stroke={PHASE_COLOR[phase]}
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress)}`}
            />
          </svg>
          <div className="pom-display" role="timer" aria-live="polite" aria-label={`${PHASE_LABEL[phase]} remaining`}>
            <span className="pom-phase-label" style={{ color: PHASE_COLOR[phase] }}>{PHASE_LABEL[phase]}</span>
            <EditableTimeDisplay
              totalSeconds={displaySecs}
              showHours={displaySecs >= 3600}
              onComplete={handleEditComplete}
              disabled={isRunning}
            />
            <div className="pom-dots" aria-label={`Session ${sessions % (settings.longAfter || 1)} of ${settings.longAfter}`}>
              {dots.map((filled, i) => (
                <span key={i} className={`pom-dot ${filled ? 'pom-dot-filled' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="pom-controls">
          {!isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={start}>
              {currentDisplayMs < totalMs && currentDisplayMs > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={pause}>Pause</button>
          )}
          <button className="btn btn-secondary btn-lg" onClick={skipPhase} title="Skip to next phase">Skip →</button>
          <button className="btn btn-secondary btn-lg" onClick={reset}>Reset</button>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-secondary ${sound ? '' : 'pom-muted'}`}
              onClick={() => { warmupAudio(); setPomodoro(p => ({ ...p, sound: !p.sound })); }}
              aria-label={sound ? 'Mute' : 'Unmute'}
            >
              {sound ? '🔔' : '🔕'}
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

        {/* Sessions counter */}
        <div className="pom-session-info text-muted text-sm">
          Sessions completed: <strong style={{ color: 'var(--text)' }}>{Math.floor(sessions)}</strong>
        </div>

        {/* Settings toggle */}
        <button className="btn btn-ghost pom-settings-toggle" onClick={() => setShowSettings(s => !s)}>
          {showSettings ? 'Hide settings' : '⚙ Settings'}
        </button>

        {showSettings && (
          <div className="card pom-settings">
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="field-label" style={{ marginBottom: '0.75rem' }}>Presets</p>
              <div className="pom-preset-grid" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {presets.map(p => (
                  <button
                    key={p.id}
                    className="btn btn-secondary"
                    onClick={() => applyPreset(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <p className="field-label" style={{ marginBottom: '1rem' }}>Timer Durations</p>
            <div className="pom-settings-grid">
              {[
                { key: 'workMins',  label: 'Work (min)' },
                { key: 'shortMins', label: 'Short break (min)' },
                { key: 'longMins',  label: 'Long break (min)' },
                { key: 'longAfter', label: 'Long break after N sessions' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="field-label" htmlFor={`pom-${key}`}>{label}</label>
                  <input
                    id={`pom-${key}`}
                    className="input"
                    type="number"
                    min="1"
                    max="120"
                    value={settings[key]}
                    onChange={e => updateSetting(key, e.target.value)}
                    disabled={isRunning}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/pomodoro'].guide} toolName="Pomodoro Timer" />
      </div>
    </>
  );
}
