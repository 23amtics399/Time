import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useTimerContext } from '../../contexts/TimerContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../contexts/ToastContext';
import EditableTimeDisplay from '../../components/EditableTimeDisplay';
import ShareButton from '../../components/ShareButton';
import CopyButton from '../../components/CopyButton';
import { playTestSound, warmupAudio } from '../../utils/audio';
import { KeyboardIcon } from '../../components/icons';
import './Countdown.css';

const DEFAULT_PRESETS = [
  { label: '1 min',  seconds: 60 },
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '20 min', seconds: 1200 },
  { label: '25 min', seconds: 1500 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
];

const INITIAL_CUSTOM_PRESETS = [
  { id: '1', name: 'Power Nap', seconds: 1200 },
  { id: '2', name: 'Tea Break', seconds: 300 },
  { id: '3', name: 'Deep Study', seconds: 2700 },
];

export default function Countdown() {
  const [searchParams] = useSearchParams();
  const { countdown, setCountdown } = useTimerContext();
  const { showToast } = useToast();
  const [customPresets, setCustomPresets] = useLocalStorage('countdown-custom-presets', INITIAL_CUSTOM_PRESETS);
  const [newPresetName, setNewPresetName] = useState('');
  const [showAddPreset, setShowAddPreset] = useState(false);

  const {
    targetTimestamp,
    remainingMs,
    configuredDurationMs,
    isRunning,
    isFinished,
    sound,
    repeat = false,
    label = '',
  } = countdown;

  const currentDisplayMs = isRunning && targetTimestamp
    ? Math.max(0, targetTimestamp - Date.now())
    : remainingMs;

  const [renderMs, setRenderMs] = useState(currentDisplayMs);
  const rafRef = useRef(null);

  // Parse shareable query params on mount
  useEffect(() => {
    const durParam = searchParams.get('duration');
    const labelParam = searchParams.get('label');
    if (durParam) {
      const secs = parseInt(durParam, 10);
      if (!isNaN(secs) && secs > 0) {
        const ms = secs * 1000;
        setCountdown(c => ({
          ...c,
          configuredDurationMs: ms,
          remainingMs: ms,
          isRunning: false,
          isFinished: false,
          targetTimestamp: null,
          label: labelParam || c.label || '',
        }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  function applyPreset(sec, presetLabel = '') {
    warmupAudio();
    const ms = sec * 1000;
    setCountdown(c => ({
      ...c,
      configuredDurationMs: ms,
      remainingMs: ms,
      isRunning: false,
      isFinished: false,
      targetTimestamp: null,
      label: presetLabel || c.label,
    }));
    showToast(`Timer set to ${Math.round(sec / 60)} min`);
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

  const start = useCallback(() => {
    warmupAudio();
    const ms = isFinished || remainingMs <= 0 ? configuredDurationMs : remainingMs;
    if (ms <= 0) return;
    setCountdown(c => ({
      ...c,
      remainingMs: ms,
      isRunning: true,
      isFinished: false,
      targetTimestamp: Date.now() + ms,
    }));
  }, [configuredDurationMs, isFinished, remainingMs, setCountdown]);

  const pause = useCallback(() => {
    setCountdown(c => ({
      ...c,
      isRunning: false,
      targetTimestamp: null,
      remainingMs: Math.max(0, (c.targetTimestamp || Date.now()) - Date.now()),
    }));
  }, [setCountdown]);

  const stop = useCallback(() => {
    setCountdown(c => ({
      ...c,
      isRunning: false,
      isFinished: false,
      targetTimestamp: null,
      remainingMs: c.configuredDurationMs,
    }));
    showToast('Timer reset');
  }, [setCountdown, showToast]);

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
        stop();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, stop]);

  function handleSaveCurrentAsPreset() {
    const name = newPresetName.trim();
    if (!name) return;
    const secs = Math.round(configuredDurationMs / 1000);
    if (secs <= 0) return;
    const newPreset = { id: String(Date.now()), name, seconds: secs };
    setCustomPresets(prev => [...(Array.isArray(prev) ? prev : []), newPreset]);
    setNewPresetName('');
    setShowAddPreset(false);
    showToast(`Preset "${name}" saved`);
  }

  function handleDeleteCustomPreset(id) {
    setCustomPresets(prev => (Array.isArray(prev) ? prev.filter(p => p.id !== id) : []));
    showToast('Preset removed');
  }

  const progress = configuredDurationMs > 0 ? 1 - renderMs / configuredDurationMs : 0;
  const displaySecs = Math.ceil(renderMs / 1000);
  const isAtFull = renderMs >= (configuredDurationMs - 500);

  // Generate share URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/countdown?duration=${Math.round(configuredDurationMs / 1000)}${label ? `&label=${encodeURIComponent(label)}` : ''}`
    : `https://time.sji.one/countdown?duration=${Math.round(configuredDurationMs / 1000)}`;

  return (
    <>
      <SEO path="/countdown" />

      <div className="tool-page cd-page">
        <div className="tool-header">
          <h1>Countdown Timer</h1>
          <p>Set a duration, save custom presets, and get notified when time is up.</p>
        </div>

        {/* Optional Timer Label */}
        {label && (
          <div className="cd-label-badge">
            <span>🏷️ {label}</span>
          </div>
        )}

        {/* Progress ring + display */}
        <div className="cd-visual">
          <svg className="cd-ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="88" className="cd-ring-bg" />
            <circle
              cx="100" cy="100" r="88"
              className={`cd-ring-progress ${isFinished ? 'cd-ring-done' : ''}`}
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
            {isFinished ? (
              <span className="cd-done-label">Time's up! 🎉</span>
            ) : (
              <span className="text-xs text-muted">Click digits to edit</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="cd-controls">
          {!isRunning ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={start}
              disabled={configuredDurationMs <= 0}
            >
              {isFinished ? 'Restart Timer' : renderMs < configuredDurationMs && renderMs > 0 ? 'Resume' : 'Start'}
            </button>
          ) : (
            <button type="button" className="btn btn-danger btn-lg" onClick={pause}>
              Pause
            </button>
          )}

          <button type="button" className="btn btn-secondary btn-lg" onClick={stop}>
            Reset
          </button>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-secondary ${sound ? '' : 'cd-muted'}`}
              onClick={() => { warmupAudio(); setCountdown(c => ({ ...c, sound: !c.sound })); }}
              aria-label={sound ? 'Mute sound' : 'Unmute sound'}
              title={sound ? 'Sound alert enabled' : 'Sound alert muted'}
            >
              {sound ? <SoundOnIcon /> : <SoundOffIcon />}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { warmupAudio(); playTestSound(); }}
              aria-label="Test alert chime"
              title="Test chime"
            >
              🎵
            </button>

            <ShareButton
              url={shareUrl}
              title={`Countdown Timer (${Math.round(configuredDurationMs / 60000)} min)`}
              text={`Join my ${Math.round(configuredDurationMs / 60000)}-minute countdown on Time Tools!`}
            />

            <CopyButton
              text={shareUrl}
              label="Copy link"
              ariaLabel="Copy shareable timer link"
            />
          </div>
        </div>

        {/* Timer Options: Repeat */}
        <div className="cd-options card">
          <label className="cd-repeat-toggle">
            <input
              type="checkbox"
              checked={repeat}
              onChange={e => {
                setCountdown(c => ({ ...c, repeat: e.target.checked }));
                showToast(e.target.checked ? 'Repeat enabled' : 'Repeat disabled');
              }}
            />
            <span className="text-sm">🔁 Repeat timer automatically when finished</span>
          </label>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="cd-shortcuts-hint">
          <KeyboardIcon />
          <span>Shortcuts: <kbd>Space</kbd> Start/Pause • <kbd>R</kbd> Reset</span>
        </div>

        {/* Custom Presets Section */}
        <div className="card cd-presets">
          <div className="cd-presets-header">
            <span className="field-label" style={{ margin: 0 }}>My Custom Presets</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowAddPreset(v => !v)}
            >
              {showAddPreset ? 'Cancel' : '+ Save Current'}
            </button>
          </div>

          {showAddPreset && (
            <div className="cd-add-preset-row">
              <input
                type="text"
                className="input cd-preset-input"
                placeholder="Preset name (e.g. Meditation)"
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                maxLength={30}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveCurrentAsPreset}
                disabled={!newPresetName.trim()}
              >
                Save ({Math.round(configuredDurationMs / 60000)}m)
              </button>
            </div>
          )}

          {Array.isArray(customPresets) && customPresets.length > 0 ? (
            <div className="cd-custom-grid">
              {customPresets.map(cp => (
                <div key={cp.id} className="cd-custom-chip">
                  <button
                    type="button"
                    className="cd-custom-chip-btn"
                    onClick={() => applyPreset(cp.seconds, cp.name)}
                    title={`Apply ${cp.name} (${Math.round(cp.seconds / 60)} min)`}
                  >
                    <span className="font-medium">{cp.name}</span>
                    <span className="text-muted text-xs font-mono">{Math.round(cp.seconds / 60)}m</span>
                  </button>
                  <button
                    type="button"
                    className="cd-custom-chip-del"
                    onClick={() => handleDeleteCustomPreset(cp.id)}
                    aria-label={`Delete ${cp.name} preset`}
                    title="Delete preset"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-faint text-xs" style={{ marginTop: '0.5rem' }}>
              No custom presets yet. Save your favorite intervals above.
            </p>
          )}
        </div>

        {/* Quick Standard Presets */}
        <div className="card cd-presets">
          <p className="field-label">Quick Presets</p>
          <div className="cd-preset-grid">
            {DEFAULT_PRESETS.map(p => (
              <button
                key={p.seconds}
                type="button"
                className={`btn btn-secondary cd-preset-btn ${configuredDurationMs === p.seconds * 1000 && isAtFull ? 'cd-preset-active' : ''}`}
                onClick={() => applyPreset(p.seconds, `${p.label} Timer`)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <ToolGuide guide={ROUTES_SEO['/countdown'].guide} toolName="Countdown Timer" />
      </div>
    </>
  );
}

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 6H2v6h2l4 4V2L4 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 5.5a4 4 0 010 7M14.5 3a7 7 0 010 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4 6H2v6h2l4 4V2L4 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 7l3 4M16 7l-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
