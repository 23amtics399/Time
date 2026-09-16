/**
 * Shared time utility functions.
 * Pure functions — no side effects, no external dependencies.
 */

/** Zero-pad a number to `width` digits */
export function pad(n, width = 2) {
  return String(Math.floor(n)).padStart(width, '0');
}

/** Format milliseconds → { h, m, s, ms } object */
export function msToComponents(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h  = Math.floor(totalSeconds / 3600);
  const m  = Math.floor((totalSeconds % 3600) / 60);
  const s  = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);
  return { h, m, s, centis, totalSeconds };
}

/** Format milliseconds → "HH:MM:SS" or "HH:MM:SS.cc" */
export function formatDuration(ms, showCentis = false) {
  const { h, m, s, centis } = msToComponents(ms);
  const base = h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
  return showCentis ? `${base}.${pad(centis)}` : base;
}

/** Format total seconds → human readable "Xh Ym Zs" */
export function formatDurationHuman(totalSeconds) {
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return (totalSeconds < 0 ? '-' : '') + parts.join(' ');
}

/** Parse "HH:MM:SS" or "MM:SS" string → total seconds */
export function parseDurationString(str) {
  const parts = str.split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

/**
 * Get difference between two Dates → { days, hours, minutes, seconds,
 * totalSeconds, totalMinutes, totalHours, totalDays, sign }
 */
export function dateDiff(from, to) {
  const sign = to >= from ? 1 : -1;
  const diffMs = Math.abs(to - from);
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours   = Math.floor(diffMs / 3600000);
  const totalDays    = Math.floor(diffMs / 86400000);

  const days    = Math.floor(diffMs / 86400000);
  const hours   = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { days, hours, minutes, seconds, totalSeconds, totalMinutes, totalHours, totalDays, sign };
}

/** Format a Date as "YYYY-MM-DDTHH:MM" for datetime-local inputs */
export function toDatetimeLocal(date) {
  const y  = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d  = pad(date.getDate());
  const h  = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

/** Format a Date as "YYYY-MM-DD" for date inputs */
export function toDateInput(date) {
  const y  = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d  = pad(date.getDate());
  return `${y}-${mo}-${d}`;
}

/** Format a Date as "HH:MM" for time inputs */
export function toTimeInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert a Unix timestamp (seconds) → Date */
export function fromUnix(ts) {
  return new Date(ts * 1000);
}

/** Convert a Date → Unix timestamp (seconds) */
export function toUnix(date) {
  return Math.floor(date.getTime() / 1000);
}

/** Format a Date to display string with options */
export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/** Get the ordinal suffix for a number (1st, 2nd, 3rd, etc.) */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Add duration to a Date. unit: 'years'|'months'|'days'|'hours'|'minutes'|'seconds' */
export function addDuration(date, amount, unit) {
  const d = new Date(date);
  switch (unit) {
    case 'years':   d.setFullYear(d.getFullYear() + amount); break;
    case 'months':  d.setMonth(d.getMonth() + amount); break;
    case 'days':    d.setDate(d.getDate() + amount); break;
    case 'hours':   d.setHours(d.getHours() + amount); break;
    case 'minutes': d.setMinutes(d.getMinutes() + amount); break;
    case 'seconds': d.setSeconds(d.getSeconds() + amount); break;
  }
  return d;
}

/** Check if a value is a valid finite number */
export function isValidNumber(v) {
  return v !== '' && v !== null && v !== undefined && isFinite(Number(v));
}

/** Clamp a value between min and max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* ── 1. Time Unit Converter Utilities ── */

export const TIME_UNIT_FACTORS = {
  microseconds: 0.000001,
  milliseconds: 0.001,
  seconds: 1,
  minutes: 60,
  hours: 3600,
  days: 86400,
  weeks: 604800,
};

export const TIME_UNIT_LABELS = {
  weeks: 'Weeks (wk)',
  days: 'Days (d)',
  hours: 'Hours (hr)',
  minutes: 'Minutes (min)',
  seconds: 'Seconds (s)',
  milliseconds: 'Milliseconds (ms)',
  microseconds: 'Microseconds (µs)',
};

/** Clean floating-point artifacts (e.g. 0.30000000000000004) */
export function cleanFloat(num, maxDecimals = 8) {
  if (!isFinite(num)) return '0';
  if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
    return num.toExponential(4);
  }
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(num * factor) / factor;
  return rounded.toString();
}

/** Convert a numeric value from a given unit to all supported time units */
export function convertTimeUnits(value, fromUnit) {
  const num = Number(value);
  if (!isValidNumber(value)) return null;

  const factorFrom = TIME_UNIT_FACTORS[fromUnit] || 1;
  const inSeconds = num * factorFrom;

  const result = {};
  for (const [unit, factor] of Object.entries(TIME_UNIT_FACTORS)) {
    const rawVal = inSeconds / factor;
    result[unit] = cleanFloat(rawVal, unit === 'microseconds' || unit === 'milliseconds' ? 2 : 6);
  }

  // Compound duration breakdown (from total seconds)
  const absSeconds = Math.abs(inSeconds);
  const w = Math.floor(absSeconds / 604800);
  const d = Math.floor((absSeconds % 604800) / 86400);
  const h = Math.floor((absSeconds % 86400) / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = Math.floor(absSeconds % 60);
  const ms = Math.floor((absSeconds % 1) * 1000);

  const parts = [];
  if (w > 0) parts.push(`${w} week${w > 1 ? 's' : ''}`);
  if (d > 0) parts.push(`${d} day${d > 1 ? 's' : ''}`);
  if (h > 0) parts.push(`${h} hr${h > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} min${m > 1 ? 's' : ''}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} sec${s > 1 ? 's' : ''}`);
  if (ms > 0) parts.push(`${ms} ms`);

  result.compoundText = (inSeconds < 0 ? '-' : '') + parts.join(' ');
  result.inSeconds = inSeconds;
  return result;
}

/* ── 2. 12-Hour / 24-Hour & Military Time Utilities ── */

const MILITARY_NUMBERS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];
const MILITARY_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty'];

function numberToSpoken(n) {
  if (n < 20) return MILITARY_NUMBERS[n];
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  return unit === 0 ? MILITARY_TENS[ten] : `${MILITARY_TENS[ten]} ${MILITARY_NUMBERS[unit]}`;
}

export function getMilitaryPronunciation(h24, m) {
  let hSpoken;
  if (h24 === 0) {
    hSpoken = 'Zero Zero';
  } else if (h24 < 10) {
    hSpoken = `Zero ${MILITARY_NUMBERS[h24]}`;
  } else {
    hSpoken = numberToSpoken(h24);
  }

  let mSpoken;
  if (m === 0) {
    mSpoken = 'Hundred Hours';
  } else if (m < 10) {
    mSpoken = `Zero ${MILITARY_NUMBERS[m]} Hours`;
  } else {
    mSpoken = `${numberToSpoken(m)} Hours`;
  }

  return `${hSpoken} ${mSpoken}`;
}

export function convert12To24(hour12, minute, ampm) {
  let h = parseInt(hour12, 10);
  const m = parseInt(minute, 10);
  if (isNaN(h) || isNaN(m)) return null;

  if (ampm === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h < 12) h += 12;
  }

  const hStr = pad(h);
  const mStr = pad(m);
  return {
    hour24: h,
    minute: m,
    time24: `${hStr}:${mStr}`,
    militaryTime: `${hStr}${mStr}`,
    pronunciation: getMilitaryPronunciation(h, m),
  };
}

export function convert24To12(hour24, minute) {
  const h = parseInt(hour24, 10);
  const m = parseInt(minute, 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;

  const ampm = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  const mStr = pad(m);
  return {
    hour12: h12,
    minute: m,
    ampm,
    time12: `${h12}:${mStr} ${ampm}`,
    time24: `${pad(h)}:${mStr}`,
    militaryTime: `${pad(h)}${mStr}`,
    pronunciation: getMilitaryPronunciation(h, m),
  };
}

/* ── 3. Working Hours & Business Time Calculator ── */

export function calculateWorkingHours({
  start,
  end,
  workStart = '09:00',
  workEnd = '17:00',
  workDays = [1, 2, 3, 4, 5], // Monday (1) to Friday (5)
  breakMinutes = 60,
}) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: 'Invalid dates provided.' };
  }

  const isReversed = startDate > endDate;
  const [d1, d2] = isReversed ? [endDate, startDate] : [startDate, endDate];

  const [wsH, wsM] = workStart.split(':').map(Number);
  const [weH, weM] = workEnd.split(':').map(Number);
  const dayStartMinutes = wsH * 60 + wsM;
  const dayEndMinutes = weH * 60 + weM;
  const grossDayWorkMinutes = Math.max(0, dayEndMinutes - dayStartMinutes);
  const netDayWorkMinutes = Math.max(0, grossDayWorkMinutes - (grossDayWorkMinutes > breakMinutes ? breakMinutes : 0));

  let totalWorkMinutes = 0;
  let totalWorkDaysCount = 0;
  let nonWorkDaysCount = 0;

  // Calendar time
  const totalCalendarMinutes = Math.round((d2 - d1) / 60000);

  // Iterate day by day
  const current = new Date(d1);
  current.setHours(0, 0, 0, 0);

  const endDay = new Date(d2);
  endDay.setHours(0, 0, 0, 0);

  while (current <= endDay) {
    const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const isWorkDay = workDays.includes(dayOfWeek);

    if (!isWorkDay) {
      nonWorkDaysCount++;
    } else {
      totalWorkDaysCount++;

      const isFirstDay = current.getTime() === d1.getTime() - (d1.getHours() * 3600000 + d1.getMinutes() * 60000 + d1.getSeconds() * 1000 + d1.getMilliseconds());
      const isLastDay = current.getTime() === endDay.getTime();

      let dayRangeStart = dayStartMinutes;
      let dayRangeEnd = dayEndMinutes;

      if (isFirstDay) {
        const firstDayMinutes = d1.getHours() * 60 + d1.getMinutes();
        dayRangeStart = Math.max(dayStartMinutes, Math.min(firstDayMinutes, dayEndMinutes));
      }

      if (isLastDay) {
        const lastDayMinutes = d2.getHours() * 60 + d2.getMinutes();
        dayRangeEnd = Math.min(dayEndMinutes, Math.max(lastDayMinutes, dayStartMinutes));
      }

      if (dayRangeEnd > dayRangeStart) {
        let workedMins = dayRangeEnd - dayRangeStart;
        // Deduct break if working at least half of the daily shift
        if (workedMins >= grossDayWorkMinutes * 0.5 && breakMinutes > 0) {
          workedMins = Math.max(0, workedMins - breakMinutes);
        } else if (workedMins > breakMinutes && breakMinutes > 0) {
          const ratio = workedMins / grossDayWorkMinutes;
          workedMins = Math.max(0, Math.round(workedMins - breakMinutes * ratio));
        }
        totalWorkMinutes += workedMins;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  const workHours = Math.floor(totalWorkMinutes / 60);
  const workMinutesRem = totalWorkMinutes % 60;
  const standard8hDays = (totalWorkMinutes / (8 * 60)).toFixed(2);
  const excludedMinutes = Math.max(0, totalCalendarMinutes - totalWorkMinutes);

  return {
    isReversed,
    totalCalendarMinutes,
    totalCalendarHours: (totalCalendarMinutes / 60).toFixed(1),
    totalWorkMinutes,
    workHours,
    workMinutesRem,
    workHoursDecimal: (totalWorkMinutes / 60).toFixed(2),
    workDaysActive: totalWorkDaysCount,
    nonWorkDays: nonWorkDaysCount,
    standard8hDays,
    excludedHours: (excludedMinutes / 60).toFixed(1),
    netDayWorkMinutes,
  };
}

/* ── 4. ISO 8601 & Machine Time Formatter ── */

export function getMachineTimeFormats(date) {
  if (!date || isNaN(date.getTime())) return null;

  const padN = (n, len = 2) => String(n).padStart(len, '0');

  const tzOffsetMinutes = -date.getTimezoneOffset();
  const sign = tzOffsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(tzOffsetMinutes);
  const offsetHours = padN(Math.floor(absOffset / 60));
  const offsetMins = padN(absOffset % 60);
  const offsetString = `${sign}${offsetHours}:${offsetMins}`;

  const localIso = `${date.getFullYear()}-${padN(date.getMonth() + 1)}-${padN(date.getDate())}T${padN(date.getHours())}:${padN(date.getMinutes())}:${padN(date.getSeconds())}${offsetString}`;

  return {
    isoUtc: date.toISOString(),
    utcString: date.toUTCString(),
    rfc2822: date.toUTCString(),
    localIso,
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    timezoneOffset: offsetString,
    localFull: date.toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
    }),
  };
}

export function parseMachineDateInput(input) {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();

  // Check if pure integer (Unix timestamp)
  if (/^-?\d+$/.test(trimmed)) {
    const num = Number(trimmed);
    // If greater than 1e11 it's ms, else seconds
    const date = num > 1e11 || num < -1e11 ? new Date(num) : new Date(num * 1000);
    if (!isNaN(date.getTime())) {
      return {
        date,
        type: num > 1e11 || num < -1e11 ? 'Unix Milliseconds' : 'Unix Seconds',
        formats: getMachineTimeFormats(date),
      };
    }
  }

  // Parse as ISO or date string
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const isIso = trimmed.includes('T') || trimmed.includes('Z');
    return {
      date,
      type: isIso ? 'ISO 8601' : 'Date String',
      formats: getMachineTimeFormats(date),
    };
  }

  return { error: 'Unable to parse input as a valid date or timestamp.' };
}

/* ── 5. Daylight Saving Time (DST) Explorer ── */

export function detectTimezoneDST(timezone, targetYear = new Date().getFullYear()) {
  try {
    // Sample 12 months throughout the year
    const offsetsByMonth = [];
    for (let m = 0; m < 12; m++) {
      const sampleDate = new Date(Date.UTC(targetYear, m, 15, 12, 0, 0));
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      });
      const parts = fmt.formatToParts(sampleDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
      offsetsByMonth.push({ month: m, offsetStr: tzPart, sampleDate });
    }

    const uniqueOffsets = [...new Set(offsetsByMonth.map(o => o.offsetStr))];
    const observesDST = uniqueOffsets.length > 1;

    // Detect next transition after now
    let nextTransition = null;
    let transitionsInYear = [];

    if (observesDST) {
      // Find transitions by checking day by day in the year
      let prevOffset = null;
      for (let day = 0; day < 365; day += 2) {
        const checkDate = new Date(Date.UTC(targetYear, 0, 1 + day, 12, 0, 0));
        const fmt = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' });
        const parts = fmt.formatToParts(checkDate);
        const curOffset = parts.find(p => p.type === 'timeZoneName')?.value || '';

        if (prevOffset && curOffset !== prevOffset) {
          // Narrow down to exact day
          for (let d = -2; d <= 0; d++) {
            const preciseDate = new Date(Date.UTC(targetYear, 0, 1 + day + d, 12, 0, 0));
            const subParts = fmt.formatToParts(preciseDate);
            const subOffset = subParts.find(p => p.type === 'timeZoneName')?.value || '';
            if (subOffset === curOffset) {
              const transitionName = curOffset > prevOffset ? 'Spring Forward (+1h)' : 'Fall Back (-1h)';
              transitionsInYear.push({
                date: preciseDate,
                formattedDate: preciseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
                fromOffset: prevOffset,
                toOffset: curOffset,
                direction: transitionName,
              });
              break;
            }
          }
        }
        prevOffset = curOffset;
      }

      // Check upcoming transition from now
      const nowTime = Date.now();
      for (const t of transitionsInYear) {
        if (t.date.getTime() >= nowTime - 86400000) {
          nextTransition = t;
          break;
        }
      }
    }

    // Current offset right now
    const nowParts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(new Date());
    const currentOffsetStr = nowParts.find(p => p.type === 'timeZoneName')?.value || '';

    return {
      timezone,
      year: targetYear,
      observesDST,
      currentOffset: currentOffsetStr,
      uniqueOffsets,
      nextTransition,
      transitionsInYear,
    };
  } catch {
    return {
      timezone,
      year: targetYear,
      observesDST: false,
      currentOffset: 'UTC',
      uniqueOffsets: ['UTC'],
      nextTransition: null,
      transitionsInYear: [],
    };
  }
}

/* ── 6. Sleep & Wake Time Planner ── */

export const SLEEP_CYCLE_MINUTES = 90;
export const DEFAULT_SLEEP_LATENCY_MINS = 14;

export function calculateSleepSchedules({
  targetTime,
  mode = 'wakeAt', // 'wakeAt' | 'sleepAt' | 'sleepNow'
  latencyMinutes = DEFAULT_SLEEP_LATENCY_MINS,
}) {
  const baseDate = new Date();

  if (mode === 'sleepNow') {
    // If sleep now, base is now + latency
    const sleepStart = new Date(baseDate.getTime() + latencyMinutes * 60000);
    const schedules = [];

    for (let cycles = 1; cycles <= 6; cycles++) {
      const wakeTime = new Date(sleepStart.getTime() + cycles * SLEEP_CYCLE_MINUTES * 60000);
      const totalMinutes = cycles * SLEEP_CYCLE_MINUTES;
      schedules.push({
        cycles,
        time: wakeTime,
        hours: (totalMinutes / 60).toFixed(1),
        label: `${cycles} cycle${cycles > 1 ? 's' : ''} (${(totalMinutes / 60).toFixed(1)} hrs of sleep)`,
        isRecommended: cycles === 5 || cycles === 6,
        description: cycles >= 5 ? 'Standard recommended sleep opportunity' : cycles >= 3 ? 'Short sleep schedule' : 'Power nap duration',
      });
    }

    return { mode, sleepStart, schedules };
  }

  // Else parse target time HH:mm
  const [targetH, targetM] = targetTime.split(':').map(Number);
  const targetDate = new Date();
  targetDate.setHours(targetH, targetM, 0, 0);

  const schedules = [];

  if (mode === 'wakeAt') {
    // Target is wake up time: calculate bedtimes by subtracting cycle durations and latency
    for (let cycles = 6; cycles >= 1; cycles--) {
      const sleepDurationMs = cycles * SLEEP_CYCLE_MINUTES * 60000;
      const bedtime = new Date(targetDate.getTime() - sleepDurationMs - latencyMinutes * 60000);
      const totalMinutes = cycles * SLEEP_CYCLE_MINUTES;
      schedules.push({
        cycles,
        time: bedtime,
        hours: (totalMinutes / 60).toFixed(1),
        label: `${cycles} cycle${cycles > 1 ? 's' : ''} (${(totalMinutes / 60).toFixed(1)} hrs of sleep)`,
        isRecommended: cycles === 5 || cycles === 6,
        description: cycles >= 5 ? 'Standard recommended sleep opportunity' : cycles >= 3 ? 'Shorter sleep opportunity' : 'Brief rest opportunity',
      });
    }
  } else {
    // Target is bedtime: calculate wake times by adding latency and cycle durations
    const sleepStart = new Date(targetDate.getTime() + latencyMinutes * 60000);
    for (let cycles = 1; cycles <= 6; cycles++) {
      const wakeTime = new Date(sleepStart.getTime() + cycles * SLEEP_CYCLE_MINUTES * 60000);
      const totalMinutes = cycles * SLEEP_CYCLE_MINUTES;
      schedules.push({
        cycles,
        time: wakeTime,
        hours: (totalMinutes / 60).toFixed(1),
        label: `${cycles} cycle${cycles > 1 ? 's' : ''} (${(totalMinutes / 60).toFixed(1)} hrs of sleep)`,
        isRecommended: cycles === 5 || cycles === 6,
        description: cycles >= 5 ? 'Standard recommended sleep opportunity' : cycles >= 3 ? 'Shorter sleep opportunity' : 'Brief rest opportunity',
      });
    }
  }

  return { mode, targetDate, schedules };
}

/* ── 7. Week Number & Day of Year (ISO 8601) ── */

export function getISOWeekDetails(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  // Clone date and set to Thursday in current week
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  target.setDate(target.getDate() - dayNr + 3);

  // First Thursday of the year defines ISO week 1
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }

  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);

  // ISO Week Year
  const dThurs = new Date(date.valueOf());
  dThurs.setDate(dThurs.getDate() - dayNr + 3);
  const isoYear = dThurs.getFullYear();

  // Day of year calculation
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diffMs = date - startOfYear;
  const dayOfYear = Math.floor(diffMs / 86400000) + 1;

  // Leap year check
  const y = date.getFullYear();
  const isLeapYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  const daysRemaining = daysInYear - dayOfYear;

  // Quarter calculation
  const quarter = Math.floor(date.getMonth() / 3) + 1;

  // Week start (Monday) and week end (Sunday)
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayNr);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const yearProgress = ((dayOfYear / daysInYear) * 100).toFixed(1);

  return {
    weekNumber,
    isoYear,
    weekYear: isoYear,
    isoDay: dayNr + 1, // 1 for Monday, 7 for Sunday
    dayOfYear,
    daysInYear,
    daysRemaining,
    quarter,
    isLeapYear,
    yearProgress,
    weekStart: monday,
    weekEnd: sunday,
    isoWeekDate: `${isoYear}-W${pad(weekNumber)}-${dayNr + 1}`,
  };
}
