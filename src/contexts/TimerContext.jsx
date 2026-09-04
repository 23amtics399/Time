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
    sound: true
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
          return { ...prev, isRunning: false, isFinished: true, targetTimestamp: null, remainingMs: 0 };
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

          if (prev.phase === 'work') {
            nextSessions += 1;
            nextPhase = nextSessions % prev.settings.longAfter === 0 ? 'long' : 'short';
            if (prev.sound) playWorkEnd();
          } else {
            if (prev.sound) playBreakEnd();
          }

          const durationMins = prev.settings[`${nextPhase}Mins`];
          const nextTarget = now + durationMins * 60 * 1000;

          return {
            ...prev,
            phase: nextPhase,
            sessions: nextSessions,
            targetTimestamp: nextTarget,
            remainingMs: durationMins * 60 * 1000
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
  return useContext(TimerContext);
}
