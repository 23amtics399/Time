import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTimerContext } from '../../contexts/TimerContext';
import { useToast } from '../../contexts/ToastContext';
import EditableTimeDisplay from '../../components/EditableTimeDisplay';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
import { playTestSound, warmupAudio } from '../../utils/audio';
import { KeyboardIcon } from '../../components/icons';
import './Pomodoro.css';

const PHASES = ['work', 'short', 'long'];
const PHASE_LABEL = { work: 'Focus', short: 'Short Break', long: 'Long Break' };
const PHASE_COLOR = { work: 'var(--accent)', short: 'var(--success)', long: 'hsl(210,85%,60%)' };

const BUILTIN_PRESETS = [
  { id: 'standard', name: 'Standard (25/5/15)', workMins: 25, shortMins: 5, longMins: 15, longAfter: 4 },
  { id: 'power_nap', name: 'Power Nap (20m)', workMins: 20, shortMins: 0, longMins: 0, longAfter: 1 },
  { id: 'deep_work', name: 'Deep Work (50/10/30)', workMins: 50, shortMins: 10, longMins: 30, longAfter: 4 },
  { id: 'study', name: 'Study (45/15/30)', workMins: 45, shortMins: 15, longMins: 30, longAfter: 3 }
];

export default function Pomodoro() {
  const [searchParams] = useSearchParams();
  const { pomodoro, setPomodoro } = useTimerContext();
  const { showToast } = useToast();
  const [presets, setPresets] = useLocalStorage('pomodoro-custom-presets', BUILTIN_PRESETS);
  const [showSettings, setShowSettings] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  
  const { targetTimestamp, remainingMs, phase, sessions, isRunning, sound, settings } = pomodoro;

  // Read URL query params on mount
  useEffect(() => {
    const pPhase = searchParams.get('phase');
    const pWork = parseInt(searchParams.get('work'), 10);
    const pShort = parseInt(searchParams.get('short'), 10);
    const pLong = parseInt(searchParams.get('long'), 10);
    const pCycle = parseInt(searchParams.get('cycle'), 10);

    if (pPhase || !isNaN(pWork) || !isNaN(pShort) || !isNaN(pLong) || !isNaN(pCycle)) {
      setPomodoro(prev => {
        const nextSettings = {
          ...prev.settings,
          workMins: !isNaN(pWork) && pWork > 0 ? pWork : prev.settings.workMins,
          shortMins: !isNaN(pShort) && pShort >= 0 ? pShort : prev.settings.shortMins,
          longMins: !isNaN(pLong) && pLong >= 0 ? pLong : prev.settings.longMins,
          longAfter: !isNaN(pCycle) && pCycle > 0 ? pCycle : prev.settings.longAfter,
        };
        const nextPhase = (pPhase && PHASES.includes(pPhase)) ? pPhase : prev.phase;
        const dur = (nextPhase === 'work' ? nextSettings.workMins : nextPhase === 'short' ? nextSettings.shortMins : nextSettings.longMins) * 60 * 1000;
        return {
          ...prev,
          phase: nextPhase,
          remainingMs: dur,
          targetTimestamp: null,
          isRunning: false,
          settings: nextSettings,
        };
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Read today's statistics
  const todayKey = `pomodoro-stats-${new Date().toISOString().slice(0, 10)}`;
  const [todayStats] = useLocalStorage(todayKey, { sessions: 0, minutes: 0 });

  const phaseDurationMs = useCallback((p = phase) => {
    if (p === 'work')  return settings.workMins  * 60 * 1000;
    if (p === 'short') return settings.shortMins * 60 * 1000;
    return settings.longMins * 60 * 1000;
  }, [phase, settings.workMins, settings.shortMins, settings.longMins]);

  const currentDisplayMs = isRunning && targetTimestamp ? Math.max(0, targetTimestamp - Date.now()) : remainingMs;
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

  const start = useCallback(() => {
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
  }, [phase, phaseDurationMs, remainingMs, setPomodoro]);

  const pause = useCallback(() => {
    setPomodoro(p => ({ 
      ...p, 
      isRunning: false, 
      targetTimestamp: null,
      remainingMs: Math.max(0, (p.targetTimestamp || Date.now()) - Date.now())
    }));
  }, [setPomodoro]);

  const reset = useCallback(() => {
    setPomodoro(p => ({
      ...p,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: phaseDurationMs(p.phase),
      sessions: 0
    }));
    showToast('Pomodoro cycle reset');
  }, [phaseDurationMs, setPomodoro, showToast]);

  const skipPhase = useCallback(() => {
    setPomodoro(p => {
      let nextPhase = 'work';
      let nextSessions = p.sessions;
      if (p.phase === 'work') {
        nextSessions += 1;
        nextPhase = nextSessions % (p.settings?.longAfter || 4) === 0 ? 'long' : 'short';
      }
      const dur = (nextPhase === 'work' ? p.settings?.workMins : nextPhase === 'short' ? p.settings?.shortMins : p.settings?.longMins) * 60 * 1000;
      return {
        ...p,
        isRunning: false,
        targetTimestamp: null,
        remainingMs: dur,
        phase: nextPhase,
        sessions: nextSessions
      };
    });
    showToast('Skipped to next phase');
  }, [setPomodoro, showToast]);

  // Keyboard shortcuts: Space (Start/Pause), R (Reset)
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) pause();
        else start();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reset();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, reset]);

  function applyPreset(preset) {
    setPomodoro(p => ({
      ...p,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: preset.workMins * 60 * 1000,
      phase: 'work',
      sessions: 0,
      settings: {
        ...p.settings,
        workMins: preset.workMins,
        shortMins: preset.shortMins,
        longMins: preset.longMins,
        longAfter: preset.longAfter || 4,
      }
    }));
    showToast(`Loaded preset "${preset.name}"`);
  }

  function handleSaveCustomPreset() {
    const name = newPresetName.trim();
    if (!name) return;
    const newP = {
      id: `custom-${Date.now()}`,
      name,
      workMins: settings.workMins,
      shortMins: settings.shortMins,
      longMins: settings.longMins,
      longAfter: settings.longAfter || 4,
    };
    setPresets(prev => [...(Array.isArray(prev) ? prev : []), newP]);
    setNewPresetName('');
    showToast(`Preset "${name}" created`);
  }

  function handleDeletePreset(id) {
    setPresets(prev => (Array.isArray(prev) ? prev.filter(p => p.id !== id) : []));
    showToast('Preset removed');
  }

  function updateSetting(key, value) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) return;
    setPomodoro(p => ({
      ...p,
      settings: { ...p.settings, [key]: n }
    }));
  }

  function updateToggleSetting(key, val) {
    setPomodoro(p => ({
      ...p,
      settings: { ...p.settings, [key]: val }
    }));
    showToast(`Setting updated`);
  }
  
  function handleEditComplete(newTotalSeconds) {
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

  const cycleLength = settings?.longAfter || 4;
  const currentInCycle = (sessions % cycleLength) + (phase === 'work' ? 1 : 0);
  const dots = Array.from({ length: cycleLength }, (_, i) => i < (sessions % cycleLength));

  // Share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pomodoro?phase=${phase}&work=${settings.workMins}&short=${settings.shortMins}&long=${settings.longMins}&cycle=${cycleLength}`
    : `https://time.sji.one/pomodoro?phase=${phase}&work=${settings.workMins}&short=${settings.shortMins}&long=${settings.longMins}&cycle=${cycleLength}`;

  return (
    <>
      <SEO path="/pomodoro" />

      <div className="tool-page pom-page">
        <div className="tool-header" style={{ textAlign: 'center' }}>
          <h1>Pomodoro Timer</h1>
          <p>Focus in customizable intervals with automated cycles and progress tracking.</p>
        </div>

        {/* Phase tabs */}
        <div className="pom-phases" role="tablist">
          {PHASES.map(p => (
            <button
              key={p}
              type="button"
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
            <span className="pom-phase-label" style={{ color: PHASE_COLOR[phase] }}>
              {phase === 'work' ? `Focus ${Math.min(cycleLength, currentInCycle)} of ${cycleLength}` : PHASE_LABEL[phase]}
            </span>
            <EditableTimeDisplay
              totalSeconds={displaySecs}
              showHours={displaySecs >= 3600}
              onComplete={handleEditComplete}
              disabled={isRunning}
            />
            {/* Session Progress Dots */}
            <div className="pom-dots" aria-label={`Cycle progress: ${sessions % cycleLength} of ${cycleLength} complete`}>
              {dots.map((filled, i) => (
                <span key={i} className={`pom-dot ${filled ? 'pom-dot-filled' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="pom-controls">
          {!isRunning ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={start}>
              {currentDisplayMs < totalMs && currentDisplayMs > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button type="button" className="btn btn-danger btn-lg" onClick={pause}>
              Pause
            </button>
          )}

          <button type="button" className="btn btn-secondary btn-lg" onClick={skipPhase} title="Skip to next phase">
            Skip →
          </button>

          <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
            Reset
          </button>
          
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-secondary ${sound ? '' : 'pom-muted'}`}
              onClick={() => { warmupAudio(); setPomodoro(p => ({ ...p, sound: !p.sound })); }}
              aria-label={sound ? 'Mute' : 'Unmute'}
              title={sound ? 'Sound alert enabled' : 'Sound alert muted'}
            >
              {sound ? '🔔' : '🔕'}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { warmupAudio(); playTestSound(); }}
              aria-label="Test chime"
              title="Test chime"
            >
              🎵
            </button>

            <ShareButton
              url={shareUrl}
              title={`Pomodoro Timer (${settings.workMins}m Focus / ${settings.shortMins}m Break)`}
              text="Track your focus session with this Pomodoro interval configuration on Time Tools!"
            />

            <CopyButton
              text={shareUrl}
              label="Copy link"
              ariaLabel="Copy shareable Pomodoro timer link"
            />
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="pom-shortcuts-hint">
          <KeyboardIcon />
          <span>Shortcuts: <kbd>Space</kbd> Start/Pause • <kbd>R</kbd> Reset</span>
        </div>

        {/* Daily Stats Summary */}
        <div className="card pom-stats-card">
          <div className="pom-stats-row">
            <span className="text-sm text-muted">Today's Focus:</span>
            <span className="font-semibold">{todayStats.sessions} {todayStats.sessions === 1 ? 'session' : 'sessions'} completed</span>
            <span className="text-muted text-xs">({todayStats.minutes} mins total)</span>
          </div>
        </div>

        {/* Settings toggle */}
        <button
          type="button"
          className="btn btn-ghost pom-settings-toggle"
          onClick={() => setShowSettings(s => !s)}
        >
          {showSettings ? '▲ Hide settings' : '⚙ Settings & Cycles'}
        </button>

        {showSettings && (
          <div className="card pom-settings">
            {/* Presets */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="field-label" style={{ marginBottom: '0.75rem' }}>Presets</p>
              <div className="pom-preset-grid">
                {presets.map(p => (
                  <div key={p.id} className="pom-preset-item">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => applyPreset(p)}
                    >
                      {p.name}
                    </button>
                    {p.id.startsWith('custom-') && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon-sm text-danger"
                        onClick={() => handleDeletePreset(p.id)}
                        aria-label={`Delete ${p.name}`}
                        title="Delete preset"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Save current preset */}
              <div className="pom-save-preset-row">
                <input
                  type="text"
                  className="input input-sm"
                  placeholder="New preset name..."
                  value={newPresetName}
                  onChange={e => setNewPresetName(e.target.value)}
                  maxLength={30}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveCustomPreset}
                  disabled={!newPresetName.trim()}
                >
                  Save Preset
                </button>
              </div>
            </div>

            {/* Durations */}
            <p className="field-label" style={{ marginBottom: '1rem' }}>Timer Durations</p>
            <div className="pom-settings-grid">
              {[
                { key: 'workMins',  label: 'Focus session (min)' },
                { key: 'shortMins', label: 'Short break (min)' },
                { key: 'longMins',  label: 'Long break (min)' },
                { key: 'longAfter', label: 'Long break after sessions' },
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

            {/* Cycle automation */}
            <div className="pom-automation-settings">
              <p className="field-label" style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>Automation</p>
              <label className="pom-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreak ?? false}
                  onChange={e => updateToggleSetting('autoStartBreak', e.target.checked)}
                />
                <span className="text-sm">Auto-start breaks when focus session ends</span>
              </label>
              <label className="pom-checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoStartWork ?? false}
                  onChange={e => updateToggleSetting('autoStartWork', e.target.checked)}
                />
                <span className="text-sm">Auto-start next focus session when break ends</span>
              </label>
            </div>
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/pomodoro'].guide} toolName="Pomodoro Timer" />
      </div>
    </>
  );
}
