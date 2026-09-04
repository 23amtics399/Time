import { createContext, useContext, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playAlarm, warmupAudio } from '../utils/audio';

function computeNextTimestamp(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1); // Already passed today, schedule for tomorrow
  }
  return target.getTime();
}

const AlarmContext = createContext();

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useLocalStorage('time-alarms', []);
  const firedAlarmsRef = useRef(new Set()); // Keep track of alarms fired in this session

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;

      setAlarms(currentAlarms => {
        const nextAlarms = currentAlarms.map(alarm => {
          if (!alarm.active) return alarm;

          // If it's time to fire and we haven't fired it recently
          if (now >= alarm.targetTimestamp && !firedAlarmsRef.current.has(alarm.id)) {
            firedAlarmsRef.current.add(alarm.id);
            hasUpdates = true;
            
            // Fire alarm
            playAlarm();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('⏰ Alarm', { body: alarm.label || 'Time to wake up!', icon: '/favicon.svg' });
            }

            // Once fired, we disable it unless it's a recurring alarm (future support)
            // For now, just mark it inactive
            return { ...alarm, active: false };
          }

          // Reset the fired flag if the target is somehow moved to the future
          if (now < alarm.targetTimestamp && firedAlarmsRef.current.has(alarm.id)) {
            firedAlarmsRef.current.delete(alarm.id);
          }

          return alarm;
        });

        return hasUpdates ? nextAlarms : currentAlarms;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [setAlarms]);

  function addAlarm(alarmData) {
    warmupAudio();
    setAlarms(prev => [...prev, { ...alarmData, id: Date.now() }]);
  }

  function deleteAlarm(id) {
    setAlarms(prev => prev.filter(a => a.id !== id));
    firedAlarmsRef.current.delete(id);
  }

  function toggleAlarm(id) {
    setAlarms(prev => prev.map(a => {
      if (a.id === id) {
        if (!a.active) {
          firedAlarmsRef.current.delete(id); // reset fired state when re-enabling
          return { ...a, active: true, targetTimestamp: computeNextTimestamp(a.time) };
        }
        return { ...a, active: false };
      }
      return a;
    }));
  }

  return (
    <AlarmContext.Provider value={{ alarms, addAlarm, deleteAlarm, toggleAlarm }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarmContext() {
  return useContext(AlarmContext);
}
