/**
 * Web Audio API — synthesized alert tones.
 * No audio files required. Works offline after page load.
 */

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Play a simple synthesized beep.
 * @param {object} options
 * @param {number} options.frequency - Hz (default 440)
 * @param {number} options.duration  - seconds (default 0.3)
 * @param {number} options.gain      - 0–1 (default 0.4)
 * @param {'sine'|'square'|'sawtooth'|'triangle'} options.type
 */
export function playBeep({
  frequency = 440,
  duration = 0.3,
  gain = 0.4,
  type = 'sine',
} = {}) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio is not available
  }
}

/**
 * Play a sequence of beeps (e.g., alarm pattern).
 * @param {number} count - number of beeps
 * @param {object} beepOptions - options for each beep
 * @param {number} interval - ms between beep starts
 */
export function playAlarmPattern(count = 3, beepOptions = {}, interval = 600) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => playBeep(beepOptions), i * interval);
  }
}

/** Play a "tick" sound (short, quiet) */
export function playTick() {
  playBeep({ frequency: 1000, duration: 0.04, gain: 0.15, type: 'sine' });
}

/** Play a countdown-end alarm (richer sequence) */
export function playAlarm() {
  // Play a pleasant 3-tone chime, repeated 3 times
  for (let i = 0; i < 3; i++) {
    const offset = i * 800; // ms
    setTimeout(() => playBeep({ frequency: 523.25, duration: 0.2, gain: 0.4, type: 'sine' }), offset);       // C5
    setTimeout(() => playBeep({ frequency: 659.25, duration: 0.2, gain: 0.4, type: 'sine' }), offset + 150); // E5
    setTimeout(() => playBeep({ frequency: 783.99, duration: 0.4, gain: 0.4, type: 'sine' }), offset + 300); // G5
  }
}

/** Play a test sound for volume verification */
export function playTestSound() {
  playBeep({ frequency: 880, duration: 0.2, gain: 0.3, type: 'sine' });
  setTimeout(() => playBeep({ frequency: 1046.50, duration: 0.3, gain: 0.3, type: 'sine' }), 200);
}

/** Play a Pomodoro work session end tone */
export function playWorkEnd() {
  // Three descending tones
  playBeep({ frequency: 660, duration: 0.4, gain: 0.45, type: 'sine' });
  setTimeout(() => playBeep({ frequency: 550, duration: 0.4, gain: 0.45, type: 'sine' }), 450);
  setTimeout(() => playBeep({ frequency: 440, duration: 0.6, gain: 0.45, type: 'sine' }), 900);
}

/** Play a Pomodoro break end tone (two rising tones) */
export function playBreakEnd() {
  playBeep({ frequency: 440, duration: 0.3, gain: 0.4, type: 'sine' });
  setTimeout(() => playBeep({ frequency: 660, duration: 0.5, gain: 0.4, type: 'sine' }), 350);
}

/** Warm up AudioContext on first user interaction (call on button click) */
export function warmupAudio() {
  try { getAudioContext(); } catch (e) {}
}
