import {
  convertTimeUnits,
  cleanFloat,
  convert12To24,
  convert24To12,
  getMilitaryPronunciation,
  calculateWorkingHours,
  getMachineTimeFormats,
  parseMachineDateInput,
  detectTimezoneDST,
  calculateSleepSchedules,
  getISOWeekDetails
} from '../src/utils/time.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

console.log('🧪 RUNNING COMPREHENSIVE TIME UTILITIES & CALCULATIONS TEST SUITE\n');

// ==========================================
// 1. TIME UNIT CONVERTER
// ==========================================
console.log('--- 1. Time Unit Converter Tests ---');
{
  // Decimal test: 2.75 hours
  const r1 = convertTimeUnits(2.75, 'hours');
  assert(r1.minutes === '165', '2.75 hours converts to exactly 165 minutes', `Got ${r1.minutes}`);
  assert(r1.seconds === '9900', '2.75 hours converts to exactly 9900 seconds', `Got ${r1.seconds}`);
  assert(r1.compoundText.includes('2 hrs 45 mins') || r1.compoundText.includes('2 hr') && r1.compoundText.includes('45 min'),
    '2.75 hours compound breakdown is 2 hrs 45 mins', `Got "${r1.compoundText}"`);

  // Floating point check: 0.3 hours
  const rFloat = convertTimeUnits(0.3, 'hours');
  assert(!String(rFloat.minutes).includes('00000000000004'), 'Floating point garbage avoided in minutes', `Got ${rFloat.minutes}`);

  // Large values test: 100000 seconds
  const r2 = convertTimeUnits(100000, 'seconds');
  assert(r2.compoundText.includes('1 day') && r2.compoundText.includes('3 hr') && r2.compoundText.includes('46 min') && r2.compoundText.includes('40 sec'),
    '100000 seconds compound is 1 day, 3 hrs, 46 mins, 40 secs',
    `Got "${r2.compoundText}"`);

  // Negative values: -15 minutes
  const r3 = convertTimeUnits(-15, 'minutes');
  assert(r3.seconds === '-900', '-15 minutes converts to -900 seconds', `Got ${r3.seconds}`);
  assert(r3.compoundText.startsWith('-'), '-15 minutes compound breakdown preserves negative sign', `Got "${r3.compoundText}"`);

  // Milliseconds test: 500000 ms
  const r4 = convertTimeUnits(500000, 'milliseconds');
  assert(r4.seconds === '500', '500000 ms = 500 seconds', `Got ${r4.seconds}`);
}

// ==========================================
// 2. 12-HOUR / 24-HOUR MILITARY TIME
// ==========================================
console.log('\n--- 2. Military Time Converter Tests ---');
{
  // 12:00 AM -> 00:00
  const m1 = convert12To24(12, 0, 'AM');
  assert(m1.time24 === '00:00' && m1.militaryTime === '0000', '12:00 AM converts to 00:00 / 0000', JSON.stringify(m1));

  // 12:00 PM -> 12:00
  const m2 = convert12To24(12, 0, 'PM');
  assert(m2.time24 === '12:00' && m2.militaryTime === '1200', '12:00 PM converts to 12:00 / 1200', JSON.stringify(m2));

  // 1:00 PM -> 13:00
  const m3 = convert12To24(1, 0, 'PM');
  assert(m3.time24 === '13:00' && m3.militaryTime === '1300', '1:00 PM converts to 13:00 / 1300', JSON.stringify(m3));

  // 11:59 PM -> 23:59
  const m4 = convert12To24(11, 59, 'PM');
  assert(m4.time24 === '23:59' && m4.militaryTime === '2359', '11:59 PM converts to 23:59 / 2359', JSON.stringify(m4));

  // 24 to 12
  const d1 = convert24To12(0, 0);
  assert(d1.hour12 === 12 && d1.minute === 0 && d1.ampm === 'AM', '00:00 converts to 12:00 AM', JSON.stringify(d1));

  const d2 = convert24To12(13, 45);
  assert(d2.hour12 === 1 && d2.minute === 45 && d2.ampm === 'PM', '13:45 converts to 1:45 PM', JSON.stringify(d2));

  // Pronunciations
  const p1 = getMilitaryPronunciation(8, 0);
  assert(p1.toLowerCase().includes('zero eight hundred'), '0800 pronunciation is "Zero Eight Hundred"', p1);

  const p2 = getMilitaryPronunciation(19, 30);
  assert(p2.toLowerCase().includes('nineteen thirty'), '1930 pronunciation is "Nineteen Thirty"', p2);
}

// ==========================================
// 3. WORKING HOURS CALCULATOR
// ==========================================
console.log('\n--- 3. Working Hours Calculator Tests ---');
{
  // Mon 2026-03-02 09:00 to Mon 2026-03-02 17:00 (1 work day, 8h shift - 1h break = 7h work)
  const startSame = '2026-03-02T09:00';
  const endSame = '2026-03-02T17:00';
  const w1 = calculateWorkingHours({
    start: startSame,
    end: endSame,
    workStart: '09:00',
    workEnd: '17:00',
    breakMinutes: 60,
    workDays: [1, 2, 3, 4, 5]
  });
  assert(w1.workHours === 7 && w1.workMinutesRem === 0, 'Same day 09:00-17:00 with 60m break = 7.0h work', `Got ${w1.workHours}h ${w1.workMinutesRem}m`);
  assert(w1.workDaysActive === 1, 'Working days count is 1', `Got ${w1.workDaysActive}`);

  // Weekend span: Sat 2026-03-07 09:00 to Sun 2026-03-08 17:00 -> 0 working hours
  const sat = '2026-03-07T09:00';
  const sun = '2026-03-08T17:00';
  const w2 = calculateWorkingHours({
    start: sat,
    end: sun,
    workStart: '09:00',
    workEnd: '17:00',
    breakMinutes: 60,
    workDays: [1, 2, 3, 4, 5]
  });
  assert(w2.totalWorkMinutes === 0, 'Weekend span yields 0 working minutes', `Got ${w2.totalWorkMinutes}`);
  assert(w2.nonWorkDays > 0, 'Non-working weekend days tracked', `Got ${w2.nonWorkDays}`);

  // Multi-day: Mon 09:00 to Fri 17:00 (5 days * 7h = 35h work)
  const fri = '2026-03-06T17:00';
  const w3 = calculateWorkingHours({
    start: startSame,
    end: fri,
    workStart: '09:00',
    workEnd: '17:00',
    breakMinutes: 60,
    workDays: [1, 2, 3, 4, 5]
  });
  assert(w3.workHours === 35, 'Full 5-day week = 35 working hours', `Got ${w3.workHours}h`);
  assert(w3.workDaysActive === 5, 'Working days count is 5', `Got ${w3.workDaysActive}`);

  // Partial day: Mon 10:30 to Mon 15:30 (5 hours gross window - break 1h = 4h work)
  const partStart = '2026-03-02T10:30';
  const partEnd = '2026-03-02T15:30';
  const w4 = calculateWorkingHours({
    start: partStart,
    end: partEnd,
    workStart: '09:00',
    workEnd: '17:00',
    breakMinutes: 60,
    workDays: [1, 2, 3, 4, 5]
  });
  assert(w4.workHours === 4 && w4.workMinutesRem === 0, 'Partial day 10:30-15:30 = 4h work', `Got ${w4.workHours}h ${w4.workMinutesRem}m`);
}

// ==========================================
// 4. TIME FORMATTER & PARSER
// ==========================================
console.log('\n--- 4. Time Formatter Tests ---');
{
  const fixed = new Date('2026-01-15T12:30:00.000Z');
  const f = getMachineTimeFormats(fixed);
  assert(f.isoUtc === '2026-01-15T12:30:00.000Z', 'ISO UTC formatted correctly', f.isoUtc);
  assert(f.unixSeconds === 1768480200, 'Unix seconds formatted correctly', f.unixSeconds);
  assert(f.unixMilliseconds === 1768480200000, 'Unix ms formatted correctly', f.unixMilliseconds);

  // Parsing valid Unix seconds
  const pUnix = parseMachineDateInput('1768480200');
  assert(!pUnix.error && pUnix.formats.isoUtc === '2026-01-15T12:30:00.000Z', 'Parses Unix timestamp correctly', JSON.stringify(pUnix));

  // Parsing ISO string
  const pIso = parseMachineDateInput('2026-01-15T12:30:00Z');
  assert(!pIso.error && pIso.formats.unixSeconds === 1768480200, 'Parses ISO string correctly', JSON.stringify(pIso));

  // Parsing invalid string
  const pInv = parseMachineDateInput('not-a-date');
  assert(pInv.error, 'Invalid string cleanly rejected', pInv.error);
}

// ==========================================
// 5. DST EXPLORER
// ==========================================
console.log('\n--- 5. DST Explorer Tests ---');
{
  // Timezone with DST: America/New_York
  const dstNY = detectTimezoneDST('America/New_York', 2026);
  assert(dstNY.observesDST === true, 'America/New_York observes DST', `Got ${dstNY.observesDST}`);
  assert(dstNY.transitionsInYear.length >= 2, 'America/New_York detects transitions in 2026', `Count: ${dstNY.transitionsInYear.length}`);

  // Timezone without DST: Asia/Kolkata
  const dstIndia = detectTimezoneDST('Asia/Kolkata', 2026);
  assert(dstIndia.observesDST === false, 'Asia/Kolkata does not observe DST', `Got ${dstIndia.observesDST}`);
  assert(dstIndia.transitionsInYear.length === 0, 'Asia/Kolkata detects 0 transitions', `Count: ${dstIndia.transitionsInYear.length}`);

  // UTC
  const dstUtc = detectTimezoneDST('UTC', 2026);
  assert(dstUtc.observesDST === false, 'UTC does not observe DST', `Got ${dstUtc.observesDST}`);
}

// ==========================================
// 6. SLEEP TIME PLANNER
// ==========================================
console.log('\n--- 6. Sleep Time Planner Tests ---');
{
  // Wake at 07:00 AM, latency 14 min
  const s1 = calculateSleepSchedules({ mode: 'wakeAt', targetTime: '07:00', latencyMinutes: 14 });
  assert(s1.schedules.length === 6, 'Returns 6 sleep schedule options', `Count: ${s1.schedules.length}`);
  // 5 cycles = 7.5h sleep + 14m latency = 7h 44m before 07:00 = 23:16 (11:16 PM)
  const option5 = s1.schedules.find(o => o.cycles === 5);
  const timeStr5 = option5.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  assert(timeStr5 === '11:16 PM', '5 cycles wake at 07:00 suggests 11:16 PM', `Got ${timeStr5}`);

  // Bed at 11:00 PM, latency 14 min
  const s2 = calculateSleepSchedules({ mode: 'sleepAt', targetTime: '23:00', latencyMinutes: 14 });
  // 5 cycles = 7.5h sleep + 14m latency = 7h 44m after 23:00 = 06:44 AM
  const optionBed5 = s2.schedules.find(o => o.cycles === 5);
  const timeBed5 = optionBed5.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  assert(timeBed5 === '06:44 AM', '5 cycles bed at 11:00 PM suggests 06:44 AM', `Got ${timeBed5}`);
}

// ==========================================
// 7. WEEK NUMBER & DAY OF YEAR (ISO 8601)
// ==========================================
console.log('\n--- 7. Week Number & Day of Year Tests ---');
{
  // 2026-01-01 is a Thursday -> ISO Week 1 of 2026
  const isoJan1 = getISOWeekDetails(new Date('2026-01-01T12:00:00'));
  assert(isoJan1.weekNumber === 1 && isoJan1.weekYear === 2026, '2026-01-01 is Week 1 of 2026', `Got Week ${isoJan1.weekNumber} of ${isoJan1.weekYear}`);
  assert(isoJan1.dayOfYear === 1, '2026-01-01 is Day 1 of the year', `Got Day ${isoJan1.dayOfYear}`);
  assert(isoJan1.quarter === 1, '2026-01-01 is Quarter 1', `Got Q${isoJan1.quarter}`);

  // 2024-12-30 is Monday, Dec 30, 2024 -> Thursday of this week is Jan 2, 2025 -> ISO Week 1 of 2025!
  const isoDecBoundary = getISOWeekDetails(new Date('2024-12-30T12:00:00'));
  assert(isoDecBoundary.weekNumber === 1 && isoDecBoundary.weekYear === 2025, '2024-12-30 is ISO Week 1 of 2025', `Got Week ${isoDecBoundary.weekNumber} of ${isoDecBoundary.weekYear}`);

  // 2020 was a leap year with 53 ISO weeks
  const iso53 = getISOWeekDetails(new Date('2020-12-31T12:00:00'));
  assert(iso53.weekNumber === 53 && iso53.weekYear === 2020, '2020-12-31 is ISO Week 53 of 2020', `Got Week ${iso53.weekNumber} of ${iso53.weekYear}`);
  assert(iso53.isLeapYear === true, '2020 is identified as leap year', `Got ${iso53.isLeapYear}`);
}

console.log('\n' + '='.repeat(50));
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL UNIT TESTS PASSED ACCORDING TO SPECIFICATION!\n');
}
