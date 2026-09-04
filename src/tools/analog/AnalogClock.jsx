import { useRef, useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import { useNow } from '../../hooks/useNow';
import { useTimeContext } from '../../contexts/TimeContext';
import './AnalogClock.css';

function drawClock(canvas, now) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.46;

  // Compute CSS variable values for theming
  const style = getComputedStyle(document.documentElement);
  const accent   = style.getPropertyValue('--accent').trim() || '#7c5af0';
  const textCol  = style.getPropertyValue('--text').trim() || '#fff';
  const mutedCol = style.getPropertyValue('--text-muted').trim() || 'rgba(255,255,255,0.5)';
  const surfCol  = style.getPropertyValue('--surface').trim() || '#13131e';
  const borderCol= style.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.08)';

  ctx.clearRect(0, 0, size, size);

  // Face
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = surfCol;
  ctx.fill();
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Outer accent ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = accent + '33';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hour tick marks
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const isHour = true;
    const tickLen = r * 0.1;
    const tickStart = r * 0.88;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * tickStart, cy + Math.sin(angle) * tickStart);
    ctx.lineTo(cx + Math.cos(angle) * (tickStart + tickLen), cy + Math.sin(angle) * (tickStart + tickLen));
    ctx.strokeStyle = i % 3 === 0 ? textCol : mutedCol;
    ctx.lineWidth   = i % 3 === 0 ? 2.5 : 1.2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Time values (smooth sweep using milliseconds)
  const ms  = now.getMilliseconds();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  let dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  let timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  if (canvas.dataset.timezone && canvas.dataset.timezone !== 'local') {
    const fmtTime = new Intl.DateTimeFormat('en-US', { timeZone: canvas.dataset.timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false });
    const parts = fmtTime.formatToParts(now);
    h = parseInt(parts.find(p => p.type === 'hour')?.value || h, 10) % 24;
    m = parseInt(parts.find(p => p.type === 'minute')?.value || m, 10);
    s = parseInt(parts.find(p => p.type === 'second')?.value || s, 10);

    dateStr = new Intl.DateTimeFormat('en-US', { timeZone: canvas.dataset.timezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
    timeStr = new Intl.DateTimeFormat('en-US', { timeZone: canvas.dataset.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
  }

  const secVal  = s + ms / 1000;
  const minVal  = m + secVal / 60;
  const hourVal = (h % 12) + minVal / 60;

  const secAngle  = (secVal / 60)  * Math.PI * 2;
  const minAngle  = (minVal / 60)  * Math.PI * 2;
  const hourAngle = (hourVal / 12) * Math.PI * 2;

  function drawHand(angle, length, width, color, rounded = true) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.15);
    ctx.lineTo(0, -r * length);
    ctx.strokeStyle = color;
    ctx.lineWidth   = width;
    ctx.lineCap     = rounded ? 'round' : 'butt';
    ctx.stroke();
    ctx.restore();
  }

  // Hour hand
  drawHand(hourAngle, 0.54, size * 0.028, textCol);
  // Minute hand
  drawHand(minAngle, 0.74, size * 0.018, textCol);
  // Second hand (accent)
  drawHand(secAngle, 0.86, size * 0.01, accent);

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.022, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();

  // Second hand center cap
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.012, 0, Math.PI * 2);
  ctx.fillStyle = surfCol;
  ctx.fill();
}

export default function AnalogClock() {
  const canvasRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const { timezone, useGlobalTimezone, timeFormat } = useTimeContext();
  const now = useNow(true, 'frame');

  const activeTimezone = useGlobalTimezone ? timezone : 'local';
  const hour12 = timeFormat === '12h';

  // Format strings for DOM outside canvas
  let dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  let timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12 });
  
  if (activeTimezone !== 'local') {
    dateStr = new Intl.DateTimeFormat('en-US', { timeZone: activeTimezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
    timeStr = new Intl.DateTimeFormat('en-US', { timeZone: activeTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12 }).format(now);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      // Calculate size based on container width AND viewport height to ensure it fits completely
      const containerWidth = canvas.parentElement.clientWidth;
      const vh = window.innerHeight;
      // Leave space for headers, text, and padding (approx 200px non-fullscreen, 100px fullscreen)
      const availableHeight = fullscreen ? vh - 120 : vh - 280;
      
      const maxSize = Math.min(containerWidth, Math.max(availableHeight, 200), 600);
      const size = maxSize * window.devicePixelRatio;
      
      canvas.width  = size;
      canvas.height = size;
      canvas.style.width  = `${size / window.devicePixelRatio}px`;
      canvas.style.height = `${size / window.devicePixelRatio}px`;
    });
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [fullscreen]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.dataset.timezone = activeTimezone;
      drawClock(canvasRef.current, now);
    }
  }, [now, activeTimezone]);

  return (
    <>
      <SEO
        title="Analog Clock"
        description="A smooth-sweep canvas-based analog clock with a clean, minimal design."
        path="/analog"
      />

      <div className={`tool-page analog-page ${fullscreen ? 'analog-fullscreen' : ''}`}>
        {fullscreen && (
          <button className="btn btn-ghost exit-fullscreen" onClick={() => setFullscreen(false)} aria-label="Exit full screen">
            <ExitFullscreenIcon />
          </button>
        )}

        {!fullscreen && (
          <div className="tool-header">
            <h1>Analog Clock</h1>
            <p>Smooth-sweep second hand, no ticking.</p>
          </div>
        )}

        <div className="analog-wrap">
          <canvas ref={canvasRef} className="analog-canvas" aria-label="Analog clock" role="img" />
        </div>

        <div className="analog-time-text text-muted text-sm" aria-live="polite">
          {timeStr} {' · '} {dateStr}
          {activeTimezone !== 'local' && ` (${activeTimezone.split('/').pop().replace('_', ' ')})`}
        </div>

        {!fullscreen && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setFullscreen(true)} aria-label="Go full screen">
              <FullscreenIcon /> Full screen
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1h4M1 1v4M15 1h-4M15 1v4M1 15h4M1 15v-4M15 15h-4M15 15v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ExitFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5 1v4H1M13 1v4h4M5 17v-4H1M13 17v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
