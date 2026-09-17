import { useState } from 'react';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { useNow } from '../../hooks/useNow';
import { useAlarmContext } from '../../contexts/AlarmContext';
import { useTimeContext } from '../../contexts/TimeContext';
import { useToast } from '../../contexts/ToastContext';
import { pad } from '../../utils/time';
import { warmupAudio } from '../../utils/audio';
import './Alarm.css';

const DAYS_OF_WEEK = [
  { index: 1, label: 'Mon' },
  { index: 2, label: 'Tue' },
  { index: 3, label: 'Wed' },
  { index: 4, label: 'Thu' },
  { index: 5, label: 'Fri' },
  { index: 6, label: 'Sat' },
  { index: 0, label: 'Sun' },
];

function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function formatCountdownToAlarm(targetTs, nowTs) {
  if (!targetTs || targetTs <= nowTs) return 'Rings soon';
  const diffMs = targetTs - nowTs;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `Rings in ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `Rings in ${hours}h ${mins}m`;
  }
  return `Rings in ${mins}m`;
}

function getRepeatBadgeText(repeatType, days = []) {
  if (repeatType === 'daily') return 'Daily';
  if (repeatType === 'weekdays') return 'Weekdays (Mon–Fri)';
  if (repeatType === 'custom' && days.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(d => dayNames[d]).join(', ');
  }
  return 'Once';
}

function AlarmItem({ alarm, onDelete, onToggle, onDuplicate, onEdit, timeFormat, now }) {
  const [h, m] = (alarm.time || '07:00').split(':').map(Number);
  const dateObj = new Date();
  dateObj.setHours(h, m, 0, 0);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  }).format(dateObj);

  const repeatLabel = getRepeatBadgeText(alarm.repeatType || 'once', alarm.days);
  const triggerText = alarm.active ? formatCountdownToAlarm(alarm.targetTimestamp, now.getTime()) : 'Off';

  return (
    <div className={`alarm-item card ${alarm.active ? 'alarm-active' : 'alarm-inactive'}`}>
      <div className="alarm-item-main">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <span className="alarm-time font-mono">{timeStr}</span>
          <span className="badge text-xs" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
            {repeatLabel}
          </span>
        </div>
        <div className="alarm-item-meta">
          {alarm.label ? (
            <span className="alarm-label font-medium">{alarm.label}</span>
          ) : (
            <span className="text-muted text-xs">Alarm</span>
          )}
          <span className="alarm-next-trigger text-xs font-mono">{triggerText}</span>
        </div>
      </div>

      <div className="alarm-item-actions">
        {/* Toggle switch */}
        <label className="alarm-toggle" aria-label={alarm.active ? 'Disable alarm' : 'Enable alarm'}>
          <input type="checkbox" checked={alarm.active} onChange={() => onToggle(alarm.id)} />
          <span className="alarm-toggle-track" />
        </label>

        {/* Edit button */}
        <button
          type="button"
          className="btn btn-ghost btn-icon-sm"
          onClick={() => onEdit(alarm)}
          aria-label={`Edit ${alarm.label || 'alarm'}`}
          title="Edit alarm"
        >
          ✎
        </button>

        {/* Duplicate button */}
        <button
          type="button"
          className="btn btn-ghost btn-icon-sm"
          onClick={() => onDuplicate(alarm.id)}
          aria-label={`Duplicate ${alarm.label || 'alarm'}`}
          title="Duplicate alarm"
        >
          ⧉
        </button>

        {/* Delete button */}
        <button
          type="button"
          className="btn btn-ghost btn-icon-sm text-danger"
          onClick={() => onDelete(alarm.id)}
          aria-label={`Delete ${alarm.label || 'alarm'}`}
          title="Delete alarm"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function Alarm() {
  const { alarms, addAlarm, updateAlarm, duplicateAlarm, deleteAlarm, toggleAlarm } = useAlarmContext();
  const { timeFormat, useGlobalTimezone, timezone } = useTimeContext();
  const { showToast } = useToast();

  const [timeInput, setTimeInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [repeatType, setRepeatType] = useState('once'); // 'once' | 'daily' | 'weekdays' | 'custom'
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [editingAlarm, setEditingAlarm] = useState(null);

  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const now = useNow(true, 'second');

  function handleAddOrUpdateAlarm() {
    if (!timeInput) return;
    warmupAudio();
    const activeTz = useGlobalTimezone ? timezone : 'local';

    if (editingAlarm) {
      updateAlarm(editingAlarm.id, {
        time: timeInput,
        label: labelInput.trim(),
        repeatType,
        days: repeatType === 'custom' ? customDays : [],
        tz: activeTz,
      });
      setEditingAlarm(null);
      showToast('Alarm updated');
    } else {
      addAlarm({
        time: timeInput,
        label: labelInput.trim(),
        repeatType,
        days: repeatType === 'custom' ? customDays : [],
        tz: activeTz,
        active: true,
      });
      showToast('Alarm scheduled');
    }

    setTimeInput('');
    setLabelInput('');
    setRepeatType('once');
  }

  function handleStartEdit(alarm) {
    setEditingAlarm(alarm);
    setTimeInput(alarm.time || '07:00');
    setLabelInput(alarm.label || '');
    setRepeatType(alarm.repeatType || 'once');
    setCustomDays(alarm.days && alarm.days.length ? alarm.days : [1, 2, 3, 4, 5]);
  }

  function handleCancelEdit() {
    setEditingAlarm(null);
    setTimeInput('');
    setLabelInput('');
    setRepeatType('once');
  }

  function handleDuplicate(id) {
    duplicateAlarm(id);
    showToast('Alarm duplicated');
  }

  function handleDelete(id) {
    deleteAlarm(id);
    showToast('Alarm deleted');
  }

  function toggleDay(dIndex) {
    setCustomDays(prev => {
      if (prev.includes(dIndex)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter(d => d !== dIndex);
      }
      return [...prev, dIndex];
    });
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
          <p>Schedule one-time or repeating alarms with custom labels and alerts.</p>
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
              <button type="button" className="btn btn-secondary btn-sm" onClick={requestNotif}>
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

        {/* Add/Edit alarm form */}
        <div className="card alarm-form">
          <p className="field-label font-semibold" style={{ marginBottom: '0.75rem' }}>
            {editingAlarm ? 'Edit Alarm' : 'Set New Alarm'}
          </p>

          <div className="alarm-form-grid">
            <div>
              <label className="field-label" htmlFor="alarm-time">Alarm Time</label>
              <input
                id="alarm-time"
                className="input"
                type="time"
                value={timeInput}
                onChange={e => setTimeInput(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="alarm-label">Label</label>
              <input
                id="alarm-label"
                className="input"
                type="text"
                placeholder="e.g. Wake up, Study, Meeting…"
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                maxLength={60}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="alarm-repeat">Repeat Schedule</label>
              <select
                id="alarm-repeat"
                className="select"
                value={repeatType}
                onChange={e => setRepeatType(e.target.value)}
              >
                <option value="once">One-time</option>
                <option value="daily">Daily (Every day)</option>
                <option value="weekdays">Selected Weekdays (Mon–Fri)</option>
                <option value="custom">Custom Days</option>
              </select>
            </div>
          </div>

          {/* Custom Days Picker */}
          {repeatType === 'custom' && (
            <div className="alarm-custom-days-wrap">
              <span className="text-xs text-muted">Select Days:</span>
              <div className="alarm-days-row">
                {DAYS_OF_WEEK.map(d => {
                  const isSelected = customDays.includes(d.index);
                  return (
                    <button
                      key={d.index}
                      type="button"
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ minWidth: 42, padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                      onClick={() => toggleDay(d.index)}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="alarm-form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddOrUpdateAlarm}
              disabled={!timeInput}
            >
              {editingAlarm ? 'Save Changes' : 'Add Alarm'}
            </button>
            {editingAlarm && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Alarms list */}
        {alarms.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>
            No alarms set. Schedule your first alarm above.
          </p>
        ) : (
          <div className="alarm-list">
            {[...alarms].sort((a, b) => a.time.localeCompare(b.time)).map(alarm => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                onDelete={handleDelete}
                onToggle={toggleAlarm}
                onDuplicate={handleDuplicate}
                onEdit={handleStartEdit}
                timeFormat={timeFormat}
                now={now}
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
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.5 7.5h7L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
