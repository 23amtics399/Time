import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { useAlarmContext } from '../../contexts/AlarmContext';
import { useTimeContext } from '../../contexts/TimeContext';
import { pad } from '../../utils/time';
import { warmupAudio } from '../../utils/audio';
import './Alarm.css';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function computeNextTimestamp(timeStr, tzString = 'local') {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  
  if (tzString === 'local') {
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  } else {
    // Iterate forward minute-by-minute (max 24h) to find the next matching wall-clock time
    // This perfectly handles Daylight Saving Time transitions without complex offset math.
    let t = now.getTime();
    t -= (t % 60000); // truncate to current minute
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tzString, hour: 'numeric', minute: 'numeric', hour12: false
    });
    
    for (let i = 0; i <= 24 * 60 + 120; i++) { // search up to 26 hours
      const p = fmt.formatToParts(new Date(t));
      let fh = 0, fm = 0;
      for (const pt of p) {
        if (pt.type === 'hour') fh = parseInt(pt.value) % 24;
        if (pt.type === 'minute') fm = parseInt(pt.value);
      }
      if (fh === h && fm === m && t > now.getTime()) {
        return t;
      }
      t += 60000;
    }
    return t;
  }
}

function AlarmItem({ alarm, onDelete, onToggle, timeFormat }) {
  const timeDate = alarm.targetTimestamp ? new Date(alarm.targetTimestamp) : new Date();
  if (!alarm.targetTimestamp) {
    const [h, m] = alarm.time.split(':').map(Number);
    timeDate.setHours(h, m, 0, 0);
  }

  const tz = alarm.tz && alarm.tz !== 'local' ? alarm.tz : undefined;
  
  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit',
    hour12: timeFormat === '12h',
    timeZone: tz
  }).format(timeDate);

  return (
    <div className={`alarm-item card ${alarm.active ? 'alarm-active' : 'alarm-inactive'}`}>
      <div className="alarm-item-main">
        <span className="alarm-time font-mono">{timeStr}</span>
        {alarm.label && <span className="alarm-label text-muted text-sm">{alarm.label}</span>}
      </div>
      <div className="alarm-item-actions">
        <label className="alarm-toggle" aria-label={alarm.active ? 'Disable alarm' : 'Enable alarm'}>
          <input type="checkbox" checked={alarm.active} onChange={() => onToggle(alarm.id)} />
          <span className="alarm-toggle-track" />
        </label>
        <button
          className="btn btn-ghost btn-icon-sm"
          onClick={() => onDelete(alarm.id)}
          aria-label="Delete alarm"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function Alarm() {
  const { alarms, addAlarm, deleteAlarm, toggleAlarm } = useAlarmContext();
  const { timeFormat, useGlobalTimezone, timezone } = useTimeContext();
  const [timeInput, setTimeInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const now = useNow(true, 'second');

  function handleAddAlarm() {
    if (!timeInput) return;
    warmupAudio();
    const activeTz = useGlobalTimezone ? timezone : 'local';
    const targetTimestamp = computeNextTimestamp(timeInput, activeTz);
    addAlarm({
      time: timeInput,
      targetTimestamp,
      tz: activeTz,
      label: labelInput.trim(),
      active: true,
      repeat: false
    });
    setLabelInput('');
  }

  function requestNotif() {
    requestNotificationPermission();
    setTimeout(() => {
      setNotifStatus(Notification.permission);
    }, 1000);
  }

  return (
    <>
      <SEO path="/alarm" />

      <div className="tool-page alarm-page">
        <div className="tool-header">
          <h1>Alarm</h1>
          <p>Set alarms with sound and desktop notifications.</p>
        </div>

        {/* Notification permission prompt */}
        {notifStatus !== 'granted' && (
          <div className="alarm-notif-prompt card">
            <p className="text-sm" style={{ marginBottom: '0.5rem' }}>
              {notifStatus === 'denied'
                ? '🔕 Desktop notifications are blocked. Alarms will still ring in the browser tab.'
                : '🔔 Enable desktop notifications to be alerted even when this tab is in the background.'}
            </p>
            {notifStatus === 'default' && (
              <button className="btn btn-secondary btn-sm" onClick={requestNotif}>
                Enable notifications
              </button>
            )}
          </div>
        )}

        {/* Current time display */}
        <div className="alarm-current text-muted text-sm" aria-live="polite">
          Current time: <strong className="font-mono" style={{ color: 'var(--text)' }}>
            {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
          </strong>
        </div>

        {/* Add alarm form */}
        <div className="card alarm-form">
          <div className="alarm-form-row">
            <div style={{ flex: 1 }}>
              <label className="field-label" htmlFor="alarm-time">Alarm time</label>
              <input
                id="alarm-time"
                className="input"
                type="time"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
              />
            </div>
            <div style={{ flex: 2 }}>
              <label className="field-label" htmlFor="alarm-label">Label (optional)</label>
              <input
                id="alarm-label"
                className="input"
                type="text"
                placeholder="e.g. Wake up, Meeting…"
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAlarm()}
                maxLength={60}
              />
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleAddAlarm} disabled={!timeInput}>
                Add Alarm
              </button>
            </div>
          </div>
        </div>

        {/* Alarms list */}
        {alarms.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>
            No alarms set. Add one above.
          </p>
        ) : (
          <div className="alarm-list">
            {[...alarms].sort((a, b) => a.time.localeCompare(b.time)).map(alarm => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                onDelete={deleteAlarm}
                onToggle={toggleAlarm}
                timeFormat={timeFormat}
              />
            ))}
          </div>
        )}

        <ToolGuide guide={ROUTES_SEO['/alarm'].guide} toolName="Alarm Clock" />
      </div>
    </>
  );
}

function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.5 7.5h7L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
