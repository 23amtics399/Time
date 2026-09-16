import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { TimeProvider } from './contexts/TimeContext';
import { AlarmProvider } from './contexts/AlarmContext';
import { TimerProvider } from './contexts/TimerContext';

/* ── Lazy-loaded tool pages ── */
const DigitalClock  = lazy(() => import('./tools/clock/DigitalClock'));
const AnalogClock   = lazy(() => import('./tools/analog/AnalogClock'));
const WorldClock    = lazy(() => import('./tools/world-clock/WorldClock'));
const Stopwatch     = lazy(() => import('./tools/stopwatch/Stopwatch'));
const Countdown     = lazy(() => import('./tools/countdown/Countdown'));
const Pomodoro      = lazy(() => import('./tools/pomodoro/Pomodoro'));
const Alarm         = lazy(() => import('./tools/alarm/Alarm'));
const UnixTimestamp = lazy(() => import('./tools/unix/UnixTimestamp'));
const TimezoneConverter = lazy(() => import('./tools/timezone/TimezoneConverter'));
const TimeDiff      = lazy(() => import('./tools/time-diff/TimeDiff'));
const AddSubtract   = lazy(() => import('./tools/add-subtract/AddSubtract'));
const DateCountdown = lazy(() => import('./tools/date-countdown/DateCountdown'));
const MeetingPlanner = lazy(() => import('./tools/meeting/MeetingPlanner'));
const TimeUnitConverter = lazy(() => import('./tools/time-converter/TimeUnitConverter'));
const MilitaryTimeConverter = lazy(() => import('./tools/military-time/MilitaryTimeConverter'));
const WorkingHours = lazy(() => import('./tools/working-hours/WorkingHours'));
const TimeFormats = lazy(() => import('./tools/time-formats/TimeFormats'));
const DSTChecker = lazy(() => import('./tools/dst-checker/DSTChecker'));
const SleepTimePlanner = lazy(() => import('./tools/sleep-time/SleepTimePlanner'));
const WeekNumber = lazy(() => import('./tools/week-number/WeekNumber'));

function ToolFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: 'var(--text-faint)',
      fontSize: '0.9rem',
    }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <TimeProvider>
      <AlarmProvider>
        <TimerProvider>
          <Layout>
            <Suspense fallback={<ToolFallback />}>
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/clock"         element={<DigitalClock />} />
                <Route path="/analog"        element={<AnalogClock />} />
                <Route path="/world-clock"   element={<WorldClock />} />
                <Route path="/stopwatch"     element={<Stopwatch />} />
                <Route path="/countdown"     element={<Countdown />} />
                <Route path="/pomodoro"      element={<Pomodoro />} />
                <Route path="/alarm"         element={<Alarm />} />
                <Route path="/unix"          element={<UnixTimestamp />} />
                <Route path="/timezone"      element={<TimezoneConverter />} />
                <Route path="/time-diff"     element={<TimeDiff />} />
                <Route path="/add-subtract"  element={<AddSubtract />} />
                <Route path="/date-countdown" element={<DateCountdown />} />
                <Route path="/meeting"       element={<MeetingPlanner />} />
                <Route path="/time-converter" element={<TimeUnitConverter />} />
                <Route path="/military-time-converter" element={<MilitaryTimeConverter />} />
                <Route path="/working-hours" element={<WorkingHours />} />
                <Route path="/time-formats"  element={<TimeFormats />} />
                <Route path="/dst-checker"   element={<DSTChecker />} />
                <Route path="/sleep-time"    element={<SleepTimePlanner />} />
                <Route path="/week-number"   element={<WeekNumber />} />
                {/* 404 fallback */}
                <Route path="*"              element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </TimerProvider>
      </AlarmProvider>
    </TimeProvider>
  );
}

function NotFound() {
  return (
    <div className="tool-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🕐</p>
      <h1 style={{ marginBottom: '0.5rem' }}>404 — Page not found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        This page doesn't exist or was moved.
      </p>
      <a href="/" className="btn btn-primary">Go home</a>
    </div>
  );
}
