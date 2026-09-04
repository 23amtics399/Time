import { useRef, useCallback, useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { useTimerContext } from '../../contexts/TimerContext';
import { formatDuration, msToComponents, pad } from '../../utils/time';
import './Stopwatch.css';

export default function Stopwatch() {
  const { stopwatch, setStopwatch } = useTimerContext();
  const { startedAt = null, elapsedBeforeStart = 0, isRunning = false, laps = [] } = stopwatch || {};
  
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
  }, [setStopwatch]);

  const lap = useCallback(() => {
    if (!isRunning && displayElapsed === 0) return;
    const currentElapsed = isRunning ? elapsedBeforeStart + (Date.now() - startedAt) : elapsedBeforeStart;
    setStopwatch(prev => {
      const splitTime = currentElapsed - (prev.laps.reduce((s, l) => s + l.split, 0));
      return { ...prev, laps: [...prev.laps, { total: currentElapsed, split: splitTime, index: prev.laps.length + 1 }] };
    });
  }, [isRunning, displayElapsed, elapsedBeforeStart, startedAt, setStopwatch]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const copyLaps = () => {
    const text = laps.map(l =>
      `Lap ${l.index}: ${formatDuration(l.split, true)} (total: ${formatDuration(l.total, true)})`
    ).join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const { h, m, s, centis } = msToComponents(displayElapsed);
  const fastestLap = laps.length > 1 ? Math.min(...laps.map(l => l.split)) : null;
  const slowestLap = laps.length > 1 ? Math.max(...laps.map(l => l.split)) : null;

  return (
    <>
      <SEO
        title="Stopwatch"
        description="A precise browser-based stopwatch with lap times, split detection, and copy to clipboard."
        path="/stopwatch"
      />

      <div className="tool-page sw-page">
        <div className="tool-header">
          <h1>Stopwatch</h1>
          <p>Measure elapsed time with lap splits.</p>
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
            <button className="btn btn-primary btn-lg" onClick={start} aria-label={displayElapsed === 0 ? 'Start' : 'Resume'}>
              {displayElapsed === 0 ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={pause} aria-label="Pause">
              Pause
            </button>
          )}

          <button
            className="btn btn-secondary btn-lg"
            onClick={lap}
            disabled={!isRunning}
            aria-label="Lap"
          >Lap</button>

          <button
            className="btn btn-secondary btn-lg"
            onClick={reset}
            disabled={isRunning && displayElapsed === 0}
            aria-label="Reset"
          >Reset</button>
        </div>

        {/* Lap table */}
        {laps.length > 0 && (
          <div className="card sw-laps">
            <div className="sw-laps-header">
              <span className="text-muted text-sm">{laps.length} lap{laps.length !== 1 ? 's' : ''}</span>
              <button className="btn btn-ghost btn-sm" onClick={copyLaps} aria-label="Copy laps to clipboard">
                Copy
              </button>
            </div>
            <div className="sw-laps-list">
              {[...laps].reverse().map(l => {
                const isFastest = fastestLap !== null && l.split === fastestLap;
                const isSlowest = slowestLap !== null && l.split === slowestLap;
                return (
                  <div key={l.index} className={`sw-lap-row ${isFastest ? 'sw-fastest' : ''} ${isSlowest ? 'sw-slowest' : ''}`}>
                    <span className="sw-lap-num text-muted text-sm">Lap {l.index}</span>
                    <span className="sw-lap-split font-mono">{formatDuration(l.split, true)}</span>
                    <span className="sw-lap-total text-faint text-sm font-mono">{formatDuration(l.total, true)}</span>
                    {isFastest && <span className="badge badge-success">Best</span>}
                    {isSlowest && <span className="badge badge-danger">Slow</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
