import { createContext, useContext, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playAlarm, warmupAudio } from '../utils/audio';

export function computeNextAlarmTimestamp(timeStr, repeatType = 'once', selectedDays = [], _tzString = 'local') {
  const [h, m] = (timeStr || '07:00').split(':').map(Number);
  const now = new Date();

  const allowedDays =
    repeatType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] :
    repeatType === 'weekdays' ? [1, 2, 3, 4, 5] :
    repeatType === 'custom' && selectedDays?.length ? selectedDays :
    null; // 'once'

  for (let offsetDays = 0; offsetDays <= 8; offsetDays++) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, h, m, 0, 0);
    if (candidate.getTime() > now.getTime()) {
      if (!allowedDays || allowedDays.includes(candidate.getDay())) {
        return candidate.getTime();
      }
    }
  }

  const fallback = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0, 0);
  return fallback.getTime();
}

const AlarmContext = createContext();

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useLocalStorage('time-alarms', []);
  const firedAlarmsRef = useRef(new Set());

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
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('⏰ Alarm', {
                body: alarm.label || 'Time to wake up!',
                icon: '/favicon.svg'
              });
            }

            // If repeating alarm, schedule next occurrence; otherwise mark inactive
            if (alarm.repeatType && alarm.repeatType !== 'once') {
              const nextTs = computeNextAlarmTimestamp(alarm.time, alarm.repeatType, alarm.days, alarm.tz);
              return { ...alarm, targetTimestamp: nextTs, active: true };
            }

            return { ...alarm, active: false };
          }

          // Reset the fired flag if the target is moved to the future
          if (now < alarm.targetTimestamp && firedAlarmsRef.current.has(alarm.id)) {
            firedAlarmsRef.current.delete(alarm.id);
          }

          return alarm;
        });

        return hasUpdates ? nextAlarms : currentAlarms;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setAlarms]);

  function addAlarm(alarmData) {
    warmupAudio();
    const id = Date.now();
    const targetTimestamp = alarmData.targetTimestamp || computeNextAlarmTimestamp(alarmData.time, alarmData.repeatType, alarmData.days, alarmData.tz);
    setAlarms(prev => [...(Array.isArray(prev) ? prev : []), { ...alarmData, id, targetTimestamp }]);
  }

  function updateAlarm(id, updatedFields) {
    setAlarms(prev => (Array.isArray(prev) ? prev.map(a => {
      if (a.id === id) {
        const next = { ...a, ...updatedFields };
        if (next.active) {
          next.targetTimestamp = computeNextAlarmTimestamp(next.time, next.repeatType, next.days, next.tz);
        }
        return next;
      }
      return a;
    }) : []));
  }

  function duplicateAlarm(id) {
    setAlarms(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      const existing = arr.find(a => a.id === id);
      if (!existing) return arr;
      const copy = {
        ...existing,
        id: Date.now(),
        label: existing.label ? `${existing.label} (Copy)` : 'Alarm Copy',
        targetTimestamp: computeNextAlarmTimestamp(existing.time, existing.repeatType, existing.days, existing.tz),
        active: true,
      };
      return [...arr, copy];
    });
  }

  function deleteAlarm(id) {
    setAlarms(prev => (Array.isArray(prev) ? prev.filter(a => a.id !== id) : []));
    firedAlarmsRef.current.delete(id);
  }

  function toggleAlarm(id) {
    setAlarms(prev => (Array.isArray(prev) ? prev.map(a => {
      if (a.id === id) {
        if (!a.active) {
          firedAlarmsRef.current.delete(id);
          return {
            ...a,
            active: true,
            targetTimestamp: computeNextAlarmTimestamp(a.time, a.repeatType, a.days, a.tz)
          };
        }
        return { ...a, active: false };
      }
      return a;
    }) : []));
  }

  return (
    <AlarmContext.Provider value={{
      alarms: Array.isArray(alarms) ? alarms : [],
      addAlarm,
      updateAlarm,
      duplicateAlarm,
      deleteAlarm,
      toggleAlarm
    }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarmContext() {
  return useContext(AlarmContext);
}
