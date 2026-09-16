import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DigitalClock from './tools/clock/DigitalClock';
import AnalogClock from './tools/analog/AnalogClock';
import WorldClock from './tools/world-clock/WorldClock';
import Stopwatch from './tools/stopwatch/Stopwatch';
import Countdown from './tools/countdown/Countdown';
import Pomodoro from './tools/pomodoro/Pomodoro';
import Alarm from './tools/alarm/Alarm';
import UnixTimestamp from './tools/unix/UnixTimestamp';
import TimezoneConverter from './tools/timezone/TimezoneConverter';
import TimeDiff from './tools/time-diff/TimeDiff';
import AddSubtract from './tools/add-subtract/AddSubtract';
import DateCountdown from './tools/date-countdown/DateCountdown';
import MeetingPlanner from './tools/meeting/MeetingPlanner';
import TimeUnitConverter from './tools/time-converter/TimeUnitConverter';
import MilitaryTimeConverter from './tools/military-time/MilitaryTimeConverter';
import WorkingHours from './tools/working-hours/WorkingHours';
import TimeFormats from './tools/time-formats/TimeFormats';
import DSTChecker from './tools/dst-checker/DSTChecker';
import SleepTimePlanner from './tools/sleep-time/SleepTimePlanner';
import WeekNumber from './tools/week-number/WeekNumber';
import { TimeProvider } from './contexts/TimeContext';
import { AlarmProvider } from './contexts/AlarmContext';
import { TimerProvider } from './contexts/TimerContext';

export function render(url) {
  const html = renderToString(
    <TimeProvider>
      <AlarmProvider>
        <TimerProvider>
          <MemoryRouter initialEntries={[url]}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clock" element={<DigitalClock />} />
                <Route path="/analog" element={<AnalogClock />} />
                <Route path="/world-clock" element={<WorldClock />} />
                <Route path="/stopwatch" element={<Stopwatch />} />
                <Route path="/countdown" element={<Countdown />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/alarm" element={<Alarm />} />
                <Route path="/unix" element={<UnixTimestamp />} />
                <Route path="/timezone" element={<TimezoneConverter />} />
                <Route path="/time-diff" element={<TimeDiff />} />
                <Route path="/add-subtract" element={<AddSubtract />} />
                <Route path="/date-countdown" element={<DateCountdown />} />
                <Route path="/meeting" element={<MeetingPlanner />} />
                <Route path="/time-converter" element={<TimeUnitConverter />} />
                <Route path="/military-time-converter" element={<MilitaryTimeConverter />} />
                <Route path="/working-hours" element={<WorkingHours />} />
                <Route path="/time-formats" element={<TimeFormats />} />
                <Route path="/dst-checker" element={<DSTChecker />} />
                <Route path="/sleep-time" element={<SleepTimePlanner />} />
                <Route path="/week-number" element={<WeekNumber />} />
              </Routes>
            </Layout>
          </MemoryRouter>
        </TimerProvider>
      </AlarmProvider>
    </TimeProvider>
  );

  return { html };
}
