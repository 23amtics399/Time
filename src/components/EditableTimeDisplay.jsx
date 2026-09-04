import { useState, useEffect } from 'react';
import { pad } from '../utils/time';
import './EditableTimeDisplay.css';

export default function EditableTimeDisplay({
  totalSeconds,
  showHours = false,
  onComplete,
  disabled = false,
  className = ''
}) {
  const [editing, setEditing] = useState(null); // 'h', 'm', 's' or null
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const [s, setS] = useState('');

  // Sync internal state when not editing
  useEffect(() => {
    if (!editing) {
      const hh = Math.floor(totalSeconds / 3600);
      const mm = Math.floor((totalSeconds % 3600) / 60);
      const ss = totalSeconds % 60;
      setH(pad(hh));
      setM(pad(mm));
      setS(pad(ss));
    }
  }, [totalSeconds, editing]);

  function handleSave() {
    let hh = parseInt(h) || 0;
    let mm = parseInt(m) || 0;
    let ss = parseInt(s) || 0;

    const newTotal = hh * 3600 + mm * 60 + ss;
    setEditing(null);
    onComplete(newTotal);
  }

  function handleKeyDown(e, field) {
    if (e.key === 'Enter') {
      e.target.blur(); // will trigger handleSave via onBlur
    }
    if (e.key === 'Escape') {
      setEditing(null); // Revert to props
    }
    // Auto-focus next field
    if (e.key === ':' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (field === 'h') document.getElementById('edit-min')?.focus();
      if (field === 'm') document.getElementById('edit-sec')?.focus();
    }
    if (e.key === 'ArrowLeft') {
      if (field === 's') document.getElementById('edit-min')?.focus();
      if (field === 'm') document.getElementById('edit-hr')?.focus();
    }
  }

  return (
    <div className={`editable-time-display font-mono ${className} ${disabled ? 'disabled' : ''}`}>
      {showHours && (
        <>
          <input
            id="edit-hr"
            className="editable-time-input"
            type="text"
            inputMode="numeric"
            value={h}
            onChange={e => setH(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onFocus={(e) => { if (!disabled) { setEditing('h'); e.target.select(); } }}
            onBlur={handleSave}
            onKeyDown={e => handleKeyDown(e, 'h')}
            disabled={disabled}
            aria-label="Hours"
          />
          <span className="editable-time-sep">:</span>
        </>
      )}
      
      <input
        id="edit-min"
        className="editable-time-input"
        type="text"
        inputMode="numeric"
        value={m}
        onChange={e => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
        onFocus={(e) => { if (!disabled) { setEditing('m'); e.target.select(); } }}
        onBlur={handleSave}
        onKeyDown={e => handleKeyDown(e, 'm')}
        disabled={disabled}
        aria-label="Minutes"
      />
      <span className="editable-time-sep">:</span>
      
      <input
        id="edit-sec"
        className="editable-time-input"
        type="text"
        inputMode="numeric"
        value={s}
        onChange={e => setS(e.target.value.replace(/\D/g, '').slice(0, 2))}
        onFocus={(e) => { if (!disabled) { setEditing('s'); e.target.select(); } }}
        onBlur={handleSave}
        onKeyDown={e => handleKeyDown(e, 's')}
        disabled={disabled}
        aria-label="Seconds"
      />
    </div>
  );
}
