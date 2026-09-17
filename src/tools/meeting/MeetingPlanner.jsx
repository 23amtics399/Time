import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import ToolGuide from '../../components/ToolGuide';
import { ROUTES_SEO } from '../../data/seoConfig';
import { TIMEZONES } from '../../data/timezones';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../contexts/ToastContext';
import CopyButton from '../../components/CopyButton';
import ShareButton from '../../components/ShareButton';
import './MeetingPlanner.css';

const DEFAULT_PARTICIPANTS = [
  { id: '1', name: 'Alex', tz: 'America/New_York', workStart: 9, workEnd: 17 },
  { id: '2', name: 'Maria', tz: 'Europe/London', workStart: 9, workEnd: 17 },
  { id: '3', name: 'Anand', tz: 'Asia/Kolkata', workStart: 9, workEnd: 18 },
];

function getSlotType(hour, workStart = 9, workEnd = 17) {
  if (hour >= workStart && hour < workEnd) return 'work';
  if (hour >= 22 || hour < 7) return 'night';
  return 'off';
}

export default function MeetingPlanner() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [participants, setParticipants] = useLocalStorage('meeting-participants-v2', DEFAULT_PARTICIPANTS);
  const [highlightHour, setHighlightHour] = useState(null);

  // New participant input state
  const [newName, setNewName] = useState('');
  const [newTz, setNewTz] = useState('Asia/Tokyo');
  const [newStart, setNewStart] = useState(9);
  const [newEnd, setNewEnd] = useState(17);
  const [showAddForm, setShowAddForm] = useState(false);

  // Initialize query parameters if provided
  useEffect(() => {
    const qDate = searchParams.get('date');
    const qTz = searchParams.get('tz');
    if (qDate && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
      setSelectedDate(qDate);
    }
    if (qTz) {
      const tzList = qTz.split(',').filter(z => TIMEZONES.some(t => t.value === z));
      if (tzList.length > 0) {
        setParticipants(tzList.map((z, idx) => {
          const tzInfo = TIMEZONES.find(t => t.value === z);
          const defaultName = tzInfo?.label.split(' ')[0] || `Person ${idx + 1}`;
          return {
            id: `p-${idx}-${z}`,
            name: defaultName,
            tz: z,
            workStart: 9,
            workEnd: 17,
          };
        }));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Base UTC date object for the selected calendar date (00:00:00 UTC)
  const baseUtc = useMemo(() => {
    const [y, m, d] = (selectedDate || todayStr).split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  }, [selectedDate, todayStr]);

  // Compute 24 hours of data for all participants
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, utcHour) => {
      const utcTime = new Date(baseUtc.getTime() + utcHour * 3600000);
      let workCount = 0;
      let nightCount = 0;

      const participantTimes = participants.map(p => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: p.tz,
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
          timeZoneName: 'short',
        }).formatToParts(utcTime);

        let h = 0, m = 0, tzName = '';
        for (const pt of parts) {
          if (pt.type === 'hour') h = parseInt(pt.value, 10) % 24;
          if (pt.type === 'minute') m = parseInt(pt.value, 10);
          if (pt.type === 'timeZoneName') tzName = pt.value;
        }

        const slotType = getSlotType(h, p.workStart, p.workEnd);
        if (slotType === 'work') workCount++;
        if (slotType === 'night') nightCount++;

        return {
          id: p.id,
          name: p.name,
          tz: p.tz,
          tzName,
          hour: h,
          minute: m,
          formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${tzName}`,
          slotType,
        };
      });

      // Score: all at work = best; any at night = bad
      const isPerfect = participants.length > 0 && workCount === participants.length;
      const isGood = workCount >= Math.max(1, participants.length - 1) && nightCount === 0;

      return {
        utcHour,
        utcTime,
        workCount,
        nightCount,
        isPerfect,
        isGood,
        participantTimes,
      };
    });
  }, [baseUtc, participants]);

  // Find best overlap hours
  const bestHour = useMemo(() => {
    if (!participants.length) return null;
    const sorted = [...hourlyData].sort((a, b) => {
      if (a.isPerfect && !b.isPerfect) return -1;
      if (!a.isPerfect && b.isPerfect) return 1;
      if (b.workCount !== a.workCount) return b.workCount - a.workCount;
      return a.nightCount - b.nightCount;
    });
    return sorted[0];
  }, [hourlyData, participants]);

  function handleAddParticipant() {
    if (!newTz) return;
    const tzInfo = TIMEZONES.find(t => t.value === newTz);
    const name = newName.trim() || tzInfo?.label.split(' ')[0] || 'Participant';
    const newP = {
      id: `part-${Date.now()}`,
      name,
      tz: newTz,
      workStart: Number(newStart),
      workEnd: Number(newEnd),
    };
    setParticipants(prev => [...(Array.isArray(prev) ? prev : []), newP]);
    setNewName('');
    setShowAddForm(false);
    showToast(`Added ${name}`);
  }

  function handleRemoveParticipant(id) {
    if (participants.length <= 1) {
      showToast('Keep at least one participant', 'error');
      return;
    }
    setParticipants(prev => prev.filter(p => p.id !== id));
    showToast('Participant removed');
  }

  const activeHourIndex = highlightHour !== null ? highlightHour : (bestHour?.utcHour ?? 14);
  const activeSlotData = hourlyData[activeHourIndex];

  // Best Overlap / active slot summary text for clipboard
  const copySummaryText = useMemo(() => {
    if (!activeSlotData) return '';
    const dateStr = baseUtc.toISOString().slice(0, 10);
    const timeSlots = activeSlotData.participantTimes
      .map(pt => `${pt.formatted} (${pt.name})`)
      .join(' / ');
    return `Meeting Time Recommendation (${dateStr}):\nUTC: ${String(activeSlotData.utcHour).padStart(2, '0')}:00\n${timeSlots}`;
  }, [activeSlotData, baseUtc]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/meeting?date=${selectedDate}&tz=${participants.map(p => p.tz).join(',')}`
    : `https://time.sji.one/meeting?date=${selectedDate}`;

  return (
    <>
      <SEO path="/meeting" />

      <div className="tool-page mp-page">
        <div className="tool-header">
          <h1>Meeting Planner</h1>
          <p>Find the best mutual meeting time across international teams and timezones.</p>
        </div>

        {/* Date Selector & Action Bar */}
        <div className="card mp-toolbar">
          <div className="mp-toolbar-left">
            <label className="field-label" htmlFor="mp-date-picker">Meeting Date</label>
            <input
              id="mp-date-picker"
              className="input input-sm"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(todayStr)}
            >
              Today
            </button>
          </div>

          <div className="mp-toolbar-right">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowAddForm(v => !v)}
            >
              {showAddForm ? 'Cancel' : '+ Add Participant'}
            </button>
            <ShareButton
              url={shareUrl}
              title="Meeting Planner Schedule"
              text={`Compare meeting times for ${participants.map(p => p.name).join(', ')} on Time Tools`}
            />
            <CopyButton
              text={copySummaryText}
              label="Copy overlap"
              ariaLabel="Copy best meeting overlap details"
            />
          </div>
        </div>

        {/* Add participant expandable drawer */}
        {showAddForm && (
          <div className="card mp-add-card animate-fade-in">
            <p className="field-label font-semibold" style={{ marginBottom: '0.75rem' }}>Add Team Member</p>
            <div className="mp-add-form-grid">
              <div>
                <label className="field-label" htmlFor="mp-new-name">Name</label>
                <input
                  id="mp-new-name"
                  type="text"
                  className="input input-sm"
                  placeholder="e.g. Anand, Alex, Tokyo HQ"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="mp-new-tz">Timezone</label>
                <select
                  id="mp-new-tz"
                  className="select select-sm"
                  value={newTz}
                  onChange={e => setNewTz(e.target.value)}
                >
                  {TIMEZONES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label" htmlFor="mp-work-start">Start Hour</label>
                  <input
                    id="mp-work-start"
                    type="number"
                    min="0"
                    max="23"
                    className="input input-sm"
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label" htmlFor="mp-work-end">End Hour</label>
                  <input
                    id="mp-work-end"
                    type="number"
                    min="1"
                    max="24"
                    className="input input-sm"
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddParticipant}
              >
                Confirm Add
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Best Overlap Highlight Box */}
        {activeSlotData && (
          <div className="card mp-recommendation-card">
            <div className="mp-rec-header">
              <span className="badge badge-success text-xs font-semibold">
                {activeHourIndex === bestHour?.utcHour ? '★ Recommended Meeting Slot' : 'Selected Time Slot'}
              </span>
              <span className="text-xs text-muted font-mono">
                UTC: {String(activeSlotData.utcHour).padStart(2, '0')}:00
              </span>
            </div>

            <div className="mp-rec-participants">
              {activeSlotData.participantTimes.map(pt => (
                <div key={pt.id} className="mp-rec-chip">
                  <span className="font-semibold text-sm">{pt.name}:</span>
                  <span className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
                    {pt.formatted}
                  </span>
                  <span className={`badge text-xs ${pt.slotType === 'work' ? 'badge-success' : pt.slotType === 'night' ? 'badge-danger' : 'badge-amber'}`}>
                    {pt.slotType === 'work' ? 'Work' : pt.slotType === 'night' ? 'Night' : 'Awake'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mp-legend">
          <span><span className="mp-legend-dot mp-legend-work" /> Working hours</span>
          <span><span className="mp-legend-dot mp-legend-off" /> Off / Outside hours</span>
          <span><span className="mp-legend-dot mp-legend-night" /> Night time (sleep)</span>
          <span><span className="mp-legend-dot mp-legend-current" /> Optimal Overlap (★)</span>
        </div>

        {/* Interactive 24-hour Matrix Grid */}
        <div className="card mp-grid-wrap" role="region" aria-label="Meeting time matrix">
          <div className="mp-grid">
            {/* UTC Header Row */}
            <div className="mp-zone-row mp-header-row">
              <div className="mp-zone-label">
                <span className="font-semibold text-xs text-muted">UTC Timeline</span>
              </div>
              <div className="mp-slots">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className={`mp-slot mp-header-slot ${activeHourIndex === i ? 'mp-slot-highlight' : ''}`}
                    onClick={() => setHighlightHour(i)}
                    title={`UTC ${String(i).padStart(2, '0')}:00`}
                  >
                    <span className="mp-slot-hour">{String(i).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlap score row */}
            <div className="mp-zone-row mp-overlap-row">
              <div className="mp-zone-label">
                <span className="text-xs font-medium text-muted">Overlap Quality</span>
              </div>
              <div className="mp-slots">
                {hourlyData.map((hData, i) => (
                  <div
                    key={i}
                    className={`mp-slot mp-overlap-slot ${hData.isPerfect ? 'mp-overlap-perfect' : hData.isGood ? 'mp-overlap-good' : ''} ${activeHourIndex === i ? 'mp-slot-highlight' : ''}`}
                    onClick={() => setHighlightHour(i)}
                    onMouseEnter={() => setHighlightHour(i)}
                    title={`${hData.workCount}/${participants.length} available at UTC ${i}:00`}
                  >
                    {hData.isPerfect ? '★' : hData.workCount > 0 ? hData.workCount : '·'}
                  </div>
                ))}
              </div>
            </div>

            {/* Participant Rows */}
            {participants.map(p => (
              <div key={p.id} className="mp-zone-row">
                <div className="mp-zone-label">
                  <div className="mp-zone-person-info">
                    <span className="mp-person-name font-semibold text-sm">{p.name}</span>
                    <span className="mp-zone-name text-xs text-muted font-mono">{p.tz.split('/').pop().replace(/_/g, ' ')}</span>
                  </div>
                  {participants.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon-sm text-faint"
                      onClick={() => handleRemoveParticipant(p.id)}
                      aria-label={`Remove ${p.name}`}
                      title={`Remove ${p.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mp-slots">
                  {hourlyData.map((hData, i) => {
                    const pt = hData.participantTimes.find(t => t.id === p.id);
                    const slotClass = pt ? `mp-slot-${pt.slotType}` : '';
                    return (
                      <div
                        key={i}
                        className={`mp-slot ${slotClass} ${activeHourIndex === i ? 'mp-slot-highlight' : ''}`}
                        onClick={() => setHighlightHour(i)}
                        onMouseEnter={() => setHighlightHour(i)}
                        title={`${p.name}: ${pt?.formatted || ''}`}
                      >
                        <span className="mp-slot-hour">{pt ? String(pt.hour).padStart(2, '0') : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-faint text-xs" style={{ textAlign: 'center', marginTop: '0.75rem' }}>
          Click or hover on any hour column above to inspect matching local times.
        </p>

        <ToolGuide guide={ROUTES_SEO['/meeting'].guide} toolName="Meeting Planner" />
      </div>
    </>
  );
}
