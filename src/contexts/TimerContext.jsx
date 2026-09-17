import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playAlarm, playWorkEnd, playBreakEnd } from '../utils/audio';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  // Stopwatch State
  const [stopwatch, setStopwatch] = useLocalStorage('time-stopwatch', {
    startedAt: null,
    elapsedBeforeStart: 0,
    isRunning: false,
    laps: []
  });

  // Countdown State
  const [countdown, setCountdown] = useLocalStorage('time-countdown', {
    targetTimestamp: null,
    remainingMs: 300000,
    configuredDurationMs: 300000,
    isRunning: false,
    isFinished: false,
    sound: true,
    repeat: false,
    label: '',
  });

  // Pomodoro State
  const [pomodoro, setPomodoro] = useLocalStorage('time-pomodoro', {
    targetTimestamp: null,
    remainingMs: 25 * 60 * 1000,
    phase: 'work',
    sessions: 0,
    isRunning: false,
    sound: true,
    settings: {
      workMins: 25,
      shortMins: 5,
      longMins: 15,
      longAfter: 4,
      autoStartBreak: false,
      autoStartWork: false,
    }
  });

  // Background monitor loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Check Countdown
      setCountdown(prev => {
        if (!prev.isRunning || !prev.targetTimestamp) return prev;
        if (now >= prev.targetTimestamp) {
          if (prev.sound) playAlarm();
          if (prev.repeat && prev.configuredDurationMs > 0) {
            const nextTarget = now + prev.configuredDurationMs;
            return {
              ...prev,
              isRunning: true,
              isFinished: false,
              targetTimestamp: nextTarget,
              remainingMs: prev.configuredDurationMs,
            };
          }
          return {
            ...prev,
            isRunning: false,
            isFinished: true,
            targetTimestamp: null,
            remainingMs: 0
          };
        }
        return prev;
      });

      // Check Pomodoro
      setPomodoro(prev => {
        if (!prev.isRunning || !prev.targetTimestamp) return prev;
        if (now >= prev.targetTimestamp) {
          // Phase finished
          let nextPhase = 'work';
          let nextSessions = prev.sessions;
          const wasWork = prev.phase === 'work';

          if (wasWork) {
            nextSessions += 1;
            const longAfter = prev.settings?.longAfter || 4;
            nextPhase = (nextSessions % longAfter === 0) ? 'long' : 'short';
            if (prev.sound) playWorkEnd();

            // Record local daily stats
            try {
              if (typeof localStorage !== 'undefined') {
                const todayKey = `pomodoro-stats-${new Date().toISOString().slice(0, 10)}`;
                const raw = localStorage.getItem(todayKey);
                const stats = raw ? JSON.parse(raw) : { sessions: 0, minutes: 0 };
                stats.sessions += 1;
                stats.minutes += (prev.settings?.workMins || 25);
                localStorage.setItem(todayKey, JSON.stringify(stats));
              }
            } catch {
              // LocalStorage fail-safe
            }
          } else {
            if (prev.sound) playBreakEnd();
          }

          const durationMins = prev.settings?.[`${nextPhase}Mins`] || (nextPhase === 'work' ? 25 : nextPhase === 'short' ? 5 : 15);
          const autoStartBreak = prev.settings?.autoStartBreak ?? false;
          const autoStartWork = prev.settings?.autoStartWork ?? false;
          const shouldRun = wasWork ? autoStartBreak : autoStartWork;
          const nextTarget = shouldRun ? now + durationMins * 60 * 1000 : null;

          return {
            ...prev,
            phase: nextPhase,
            sessions: nextSessions,
            isRunning: shouldRun,
            targetTimestamp: nextTarget,
            remainingMs: durationMins * 60 * 1000,
          };
        }
        return prev;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [setCountdown, setPomodoro]);

  return (
    <TimerContext.Provider value={{
      countdown, setCountdown,
      pomodoro, setPomodoro,
      stopwatch, setStopwatch
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
}
