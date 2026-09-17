import { useRef, useCallback, useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useTimerContext } from '../../contexts/TimerContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDuration, msToComponents, pad } from '../../utils/time';
import { KeyboardIcon, ExportIcon } from '../../components/icons';
import './Stopwatch.css';

export default function Stopwatch() {
  const { stopwatch, setStopwatch } = useTimerContext();
  const { startedAt = null, elapsedBeforeStart = 0, isRunning = false, laps = [] } = stopwatch || {};
  const { showToast } = useToast();
  
  const [displayElapsed, setDisplayElapsed] = useState(
    isRunning ? elapsedBeforeStart + (Date.now() - startedAt) : elapsedBeforeStart
  );
  
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    if (!isRunning || !startedAt) return;
    setDisplayElapsed(elapsedBeforeStart + (Date.now() - startedAt));
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, startedAt, elapsedBeforeStart]);

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setDisplayElapsed(elapsedBeforeStart);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRunning, tick, elapsedBeforeStart]);

  const start = useCallback(() => {
    setStopwatch(prev => ({
      ...prev,
      startedAt: Date.now(),
      isRunning: true
    }));
  }, [setStopwatch]);

  const pause = useCallback(() => {
    setStopwatch(prev => ({
      ...prev,
      elapsedBeforeStart: prev.elapsedBeforeStart + (Date.now() - prev.startedAt),
      startedAt: null,
      isRunning: false
    }));
  }, [setStopwatch]);

  const reset = useCallback(() => {
    setStopwatch(prev => ({
      ...prev,
      startedAt: null,
      elapsedBeforeStart: 0,
      isRunning: false,
      laps: []
    }));
    setDisplayElapsed(0);
    showToast('Stopwatch reset');
  }, [setStopwatch, showToast]);

  const lap = useCallback(() => {
    if (!isRunning && displayElapsed === 0) return;
    const currentElapsed = isRunning ? elapsedBeforeStart + (Date.now() - startedAt) : elapsedBeforeStart;
    setStopwatch(prev => {
      const priorSplits = prev.laps.reduce((s, l) => s + l.split, 0);
      const splitTime = currentElapsed - priorSplits;
      return {
        ...prev,
        laps: [...prev.laps, { total: currentElapsed, split: splitTime, index: prev.laps.length + 1 }]
      };
    });
  }, [isRunning, displayElapsed, elapsedBeforeStart, startedAt, setStopwatch]);

  // Keyboard shortcuts: Space (Start/Pause), L (Lap), R (Reset)
  useEffect(() => {
    function handleKeyDown(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) pause();
        else start();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (isRunning) lap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reset();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, start, pause, lap, reset]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const copyLaps = () => {
    if (!laps.length) return;
    const text = laps.map(l =>
      `Lap ${l.index}: ${formatDuration(l.split, true)} (total: ${formatDuration(l.total, true)})`
    ).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast('Laps copied to clipboard');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  };

  const exportLapsText = () => {
    if (!laps.length) return;
    const lines = [
      'Time Tools — Stopwatch Laps',
      `Exported: ${new Date().toLocaleString()}`,
      `Total Laps: ${laps.length}`,
      '',
      ...laps.map(l => `Lap ${l.index}: ${formatDuration(l.split, true)} (Total: ${formatDuration(l.total, true)})`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stopwatch-laps-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as Text (.txt)');
  };

  const exportLapsCsv = () => {
    if (!laps.length) return;
    const rows = [
      ['Lap Number', 'Lap Split (Formatted)', 'Total Elapsed (Formatted)', 'Split ms', 'Total ms'],
      ...laps.map(l => [
        l.index,
        `"${formatDuration(l.split, true)}"`,
        `"${formatDuration(l.total, true)}"`,
        l.split,
        l.total,
      ])
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stopwatch-laps-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported as CSV (.csv)');
  };

  const { h, m, s, centis } = msToComponents(displayElapsed);
  const fastestLap = laps.length > 1 ? Math.min(...laps.map(l => l.split)) : null;
  const slowestLap = laps.length > 1 ? Math.max(...laps.map(l => l.split)) : null;
  const avgLap = laps.length > 0 ? Math.round(laps.reduce((sum, l) => sum + l.split, 0) / laps.length) : null;

  return (
    <>
      <SEO path="/stopwatch" />

      <div className="tool-page sw-page">
        <div className="tool-header">
          <h1>Stopwatch</h1>
          <p>Measure elapsed time with lap splits, stats, and export.</p>
        </div>

        {/* Display */}
        <div className="sw-display card" role="timer" aria-live="polite" aria-label="Stopwatch time">
          <div className="sw-time display">
            {h > 0 && <><span>{pad(h)}</span><span className="sw-sep">:</span></>}
            <span>{pad(m)}</span>
            <span className="sw-sep">:</span>
            <span>{pad(s)}</span>
            <span className="sw-centis">.{pad(centis)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="sw-controls">
          {!isRunning ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={start}
              aria-label={displayElapsed === 0 ? 'Start' : 'Resume'}
            >
              {displayElapsed === 0 ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger btn-lg"
              onClick={pause}
              aria-label="Pause"
            >
              Pause
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={lap}
            disabled={!isRunning}
            aria-label="Lap"
          >
            Lap
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={reset}
            disabled={!isRunning && displayElapsed === 0}
            aria-label="Reset"
          >
            Reset
          </button>
        </div>

        {/* Keyboard shortcut affordance */}
        <div className="sw-shortcuts-hint">
          <KeyboardIcon />
          <span>
            Shortcuts: <kbd>Space</kbd> Start/Pause • <kbd>L</kbd> Lap • <kbd>R</kbd> Reset
          </span>
        </div>

        {/* Lap statistics & table */}
        {laps.length > 0 && (
          <div className="card sw-laps">
            <div className="sw-laps-header">
              <span className="text-muted text-sm font-medium">
                {laps.length} {laps.length === 1 ? 'Lap' : 'Laps'} Recorded
              </span>

              <div className="sw-laps-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={copyLaps}
                  aria-label="Copy laps to clipboard"
                  title="Copy laps"
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={exportLapsText}
                  aria-label="Export laps as plain text"
                  title="Download TXT"
                >
                  <ExportIcon style={{ width: 13, height: 13 }} /> TXT
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={exportLapsCsv}
                  aria-label="Export laps as CSV spreadsheet"
                  title="Download CSV"
                >
                  <ExportIcon style={{ width: 13, height: 13 }} /> CSV
                </button>
              </div>
            </div>

            {/* Lap stats summary */}
            {laps.length > 1 && (
              <div className="sw-stats-bar">
                <div className="sw-stat-item">
                  <span className="sw-stat-label text-xs text-muted">Fastest</span>
                  <span className="sw-stat-val text-success font-mono font-medium">
                    {formatDuration(fastestLap, true)}
                  </span>
                </div>
                <div className="sw-stat-item">
                  <span className="sw-stat-label text-xs text-muted">Slowest</span>
                  <span className="sw-stat-val text-danger font-mono font-medium">
                    {formatDuration(slowestLap, true)}
                  </span>
                </div>
                <div className="sw-stat-item">
                  <span className="sw-stat-label text-xs text-muted">Average</span>
                  <span className="sw-stat-val text-muted font-mono font-medium">
                    {formatDuration(avgLap, true)}
                  </span>
                </div>
              </div>
            )}

            <div className="sw-laps-list">
              {[...laps].reverse().map(l => {
                const isFastest = fastestLap !== null && l.split === fastestLap;
                const isSlowest = slowestLap !== null && l.split === slowestLap;
                return (
                  <div
                    key={l.index}
                    className={`sw-lap-row ${isFastest ? 'sw-fastest' : ''} ${isSlowest ? 'sw-slowest' : ''}`}
                  >
                    <span className="sw-lap-num text-muted text-sm font-medium">Lap {l.index}</span>
                    <span className="sw-lap-split font-mono">{formatDuration(l.split, true)}</span>
                    <span className="sw-lap-total text-faint text-sm font-mono">{formatDuration(l.total, true)}</span>
                    {isFastest && <span className="badge badge-success text-xs">Best</span>}
                    {isSlowest && <span className="badge badge-danger text-xs">Slow</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/stopwatch'].guide} toolName="Stopwatch" />
      </div>
    </>
  );
}
