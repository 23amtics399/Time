import { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TimeContext = createContext();

export function TimeProvider({ children }) {
  const [timezone, setTimezone] = useLocalStorage('primary-timezone', 'local');
  const [useGlobalTimezone, setUseGlobalTimezone] = useLocalStorage('use-global-timezone', false);
  const [timeFormat, setTimeFormat] = useLocalStorage('global-time-format', '24h');

  return (
    <TimeContext.Provider value={{
      timezone, setTimezone,
      useGlobalTimezone, setUseGlobalTimezone,
      timeFormat, setTimeFormat
    }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTimeContext() {
  return useContext(TimeContext);
}
