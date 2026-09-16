import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');

// --- CRC32 & PNG Chunk Helpers ---
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, getPixelRgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const raw = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// --- 2D Signed Distance & Math Helpers ---
function sdRoundBox(x, y, cx, cy, w, h, r) {
  const dx = Math.abs(x - cx) - (w / 2 - r);
  const dy = Math.abs(y - cy) - (h / 2 - r);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  const outside = Math.hypot(ax, ay);
  const inside = Math.min(Math.max(dx, dy), 0);
  return outside + inside - r;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.hypot(dx, dy);
}

function smoothAlpha(distance, width = 1.0) {
  return Math.max(0, Math.min(1, 0.5 - distance / width));
}

function blend(base, overlay, alpha) {
  const a = (overlay[3] / 255) * alpha;
  const inv = 1 - a;
  return [
    Math.round(base[0] * inv + overlay[0] * a),
    Math.round(base[1] * inv + overlay[1] * a),
    Math.round(base[2] * inv + overlay[2] * a),
    Math.round(base[3] * inv + 255 * a),
  ];
}

// --- Clock Icon Pixel Shader (Used for 16x16, 32x32, 180x180, 192x192, 512x512) ---
function getClockIconPixel(x, y, size) {
  const cx = size / 2;
  const cy = size / 2;

  // Background squircle (rounded rectangle)
  const pad = size * 0.05;
  const boxRadius = size * 0.22;
  const dBox = sdRoundBox(x, y, cx, cy, size - pad * 2, size - pad * 2, boxRadius);
  const boxAlpha = smoothAlpha(dBox, 1.2);
  if (boxAlpha <= 0) return [0, 0, 0, 0];

  // Base gradient: deep midnight violet
  const gradT = (x + y) / (size * 2);
  const rBg = Math.round(24 + gradT * (12 - 24));
  const gBg = Math.round(19 + gradT * (9 - 19));
  const bBg = Math.round(51 + gradT * (25 - 51));
  let color = [rBg, gBg, bBg, Math.round(255 * boxAlpha)];

  // Subtle inner border
  const dBorder = Math.abs(dBox) - 1.0;
  const borderAlpha = smoothAlpha(dBorder, 1.0);
  color = blend(color, [255, 255, 255, 40], borderAlpha);

  // Outer clock bezel ring
  const ringRadius = size * 0.35;
  const ringThick = Math.max(1.2, size * 0.05);
  const dRing = Math.abs(Math.hypot(x - cx, y - cy) - ringRadius) - ringThick / 2;
  const ringAlpha = smoothAlpha(dRing, 1.0);
  color = blend(color, [167, 139, 250, 240], ringAlpha);

  // Cardinal tick marks
  const tickLen = size * 0.07;
  const tickThick = Math.max(1.0, size * 0.035);
  const rOuter = ringRadius - size * 0.02;
  const rInner = rOuter - tickLen;

  // 12 o'clock
  const d12 = sdSegment(x, y, cx, cy - rOuter, cx, cy - rInner) - tickThick / 2;
  color = blend(color, [196, 181, 253, 255], smoothAlpha(d12, 0.9));
  // 6 o'clock
  const d6 = sdSegment(x, y, cx, cy + rInner, cx, cy + rOuter) - tickThick / 2;
  color = blend(color, [196, 181, 253, 255], smoothAlpha(d6, 0.9));
  // 9 o'clock
  const d9 = sdSegment(x, y, cx - rOuter, cy, cx - rInner, cy) - tickThick / 2;
  color = blend(color, [196, 181, 253, 255], smoothAlpha(d9, 0.9));
  // 3 o'clock
  const d3 = sdSegment(x, y, cx + rInner, cy, cx + rOuter, cy) - tickThick / 2;
  color = blend(color, [196, 181, 253, 255], smoothAlpha(d3, 0.9));

  // Hands: ~10:10
  // Hour hand pointing to 10:10 (angle = -140 deg)
  const hAngle = (-140 * Math.PI) / 180;
  const hLen = size * 0.20;
  const hx = cx + Math.cos(hAngle) * hLen;
  const hy = cy + Math.sin(hAngle) * hLen;
  const dHour = sdSegment(x, y, cx, cy, hx, hy) - Math.max(1.2, size * 0.045);
  color = blend(color, [255, 255, 255, 255], smoothAlpha(dHour, 0.9));

  // Minute hand pointing to ~2 o'clock (angle = -35 deg)
  const mAngle = (-35 * Math.PI) / 180;
  const mLen = size * 0.27;
  const mx = cx + Math.cos(mAngle) * mLen;
  const my = cy + Math.sin(mAngle) * mLen;
  const dMin = sdSegment(x, y, cx, cy, mx, my) - Math.max(1.0, size * 0.035);
  color = blend(color, [255, 255, 255, 255], smoothAlpha(dMin, 0.9));

  // Center pivot dot
  const dDot = Math.hypot(x - cx, y - cy) - Math.max(1.8, size * 0.05);
  color = blend(color, [167, 139, 250, 255], smoothAlpha(dDot, 0.9));
  const dDotInner = Math.hypot(x - cx, y - cy) - Math.max(0.8, size * 0.02);
  color = blend(color, [255, 255, 255, 255], smoothAlpha(dDotInner, 0.8));

  return color;
}

// --- 5x7 Dot-Matrix Font for Rendering Crisp Typography on OG Image ---
const FONT_5X7 = {
  'A': [0x0C, 0x12, 0x12, 0x1E, 0x12, 0x12, 0x12],
  'B': [0x1C, 0x12, 0x12, 0x1C, 0x12, 0x12, 0x1C],
  'C': [0x0E, 0x12, 0x10, 0x10, 0x10, 0x12, 0x0E],
  'D': [0x1C, 0x12, 0x12, 0x12, 0x12, 0x12, 0x1C],
  'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
  'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
  'G': [0x0E, 0x12, 0x10, 0x17, 0x12, 0x12, 0x0F],
  'H': [0x12, 0x12, 0x12, 0x1E, 0x12, 0x12, 0x12],
  'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
  'K': [0x12, 0x14, 0x18, 0x10, 0x18, 0x14, 0x12],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
  'M': [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
  'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
  'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
  'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
  'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1B, 0x11],
  'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
  '0': [0x0E, 0x13, 0x15, 0x15, 0x19, 0x11, 0x0E],
  '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
  '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
  '3': [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
  '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
  '5': [0x1F, 0x10, 0x10, 0x1E, 0x01, 0x01, 0x1E],
  '6': [0x0E, 0x10, 0x10, 0x1E, 0x11, 0x11, 0x0E],
  '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
  '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x01, 0x0E],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06],
  ':': [0x00, 0x06, 0x06, 0x00, 0x06, 0x06, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
  '+': [0x00, 0x04, 0x04, 0x1F, 0x04, 0x04, 0x00],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  '•': [0x00, 0x00, 0x0E, 0x0E, 0x0E, 0x00, 0x00],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

function getCharBit(ch, col, row) {
  const glyph = FONT_5X7[ch.toUpperCase()] || FONT_5X7[' '];
  const rowByte = glyph[row] || 0;
  return (rowByte & (1 << (4 - col))) !== 0;
}

// Draw string on image bitmap
function renderTextToGrid(text, startX, startY, scale, gridWidth, gridHeight, outBuffer) {
  let curX = startX;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (getCharBit(ch, col, row)) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const px = curX + col * scale + dx;
              const py = startY + row * scale + dy;
              if (px >= 0 && px < gridWidth && py >= 0 && py < gridHeight) {
                outBuffer[py * gridWidth + px] = true;
              }
            }
          }
        }
      }
    }
    curX += (5 + 1) * scale;
  }
}

// --- High Resolution 1200x630 Open Graph & Twitter Social Card ---
function generateOgImage() {
  const W = 1200;
  const H = 630;

  // Pre-render text layers into a bitmask
  const textMask = new Uint8Array(W * H);
  const badgeMask = new Uint8Array(W * H);
  const pillMask = new Uint8Array(W * H);

  // Badge: "TIME.SJI.ONE"
  renderTextToGrid('TIME.SJI.ONE', 126, 126, 3, W, H, badgeMask);

  // Main Header: "TIME TOOLS"
  renderTextToGrid('TIME TOOLS', 90, 195, 11, W, H, textMask);

  // Subtitle: "CLOCKS • TIMERS • TIMEZONES • PLANNING"
  renderTextToGrid('CLOCKS • TIMERS • TIMEZONES • PLANNING', 92, 305, 3, W, H, textMask);

  // Feature pills (2 rows of 2):
  renderTextToGrid('20 FREE ONLINE TOOLS', 114, 402, 3, W, H, pillMask);
  renderTextToGrid('100% CLIENT-SIDE', 504, 402, 3, W, H, pillMask);
  renderTextToGrid('ZERO ADS • PRIVATE', 114, 462, 3, W, H, pillMask);
  renderTextToGrid('OFFLINE CAPABLE', 484, 462, 3, W, H, pillMask);

  return createPng(W, H, (x, y) => {
    // 1. Cosmic background gradient
    const t = y / H;
    const rBase = Math.round(9 + (15 - 9) * t);
    const gBase = Math.round(8 + (12 - 8) * t);
    const bBase = Math.round(20 + (32 - 20) * t);
    let color = [rBase, gBase, bBase, 255];

    // Radial purple glow around clock center (x=970, y=315)
    const distClock = Math.hypot(x - 970, y - 315);
    if (distClock < 420) {
      const glow = Math.pow(1 - distClock / 420, 2) * 0.45;
      color = blend(color, [139, 92, 246, 255], glow);
    }

    // Radial soft blue glow around top left (x=250, y=200)
    const distLeft = Math.hypot(x - 250, y - 200);
    if (distLeft < 500) {
      const glowL = Math.pow(1 - distLeft / 500, 2) * 0.22;
      color = blend(color, [99, 102, 241, 255], glowL);
    }

    // Subtle background grid
    if (x % 40 === 0 || y % 40 === 0) {
      color = blend(color, [255, 255, 255, 255], 0.03);
    }

    // 2. Right Side: Stylized High-Tech Clock Illustration
    const cx = 970;
    const cy = 315;
    const rClock = 180;

    // Dial background disc
    const dDial = Math.hypot(x - cx, y - cy) - rClock;
    if (dDial < 0) {
      color = blend(color, [16, 12, 34, 230], smoothAlpha(dDial, 1.5));
    }

    // Outer Bezel Ring
    const dOuterRing = Math.abs(Math.hypot(x - cx, y - cy) - rClock) - 3.5;
    color = blend(color, [167, 139, 250, 255], smoothAlpha(dOuterRing, 1.2));

    // Inner Accent Track
    const dTrack = Math.abs(Math.hypot(x - cx, y - cy) - (rClock - 14)) - 1.2;
    color = blend(color, [139, 92, 246, 140], smoothAlpha(dTrack, 1.0));

    // 12 Major Hour Ticks
    const dDist = Math.hypot(x - cx, y - cy);
    if (dDist > rClock - 26 && dDist < rClock - 6) {
      const angle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
      const nearestHour = Math.round((angle / (Math.PI * 2)) * 12);
      const hourAngle = (nearestHour * Math.PI * 2) / 12 - Math.PI / 2;
      const tx1 = cx + Math.cos(hourAngle) * (rClock - 26);
      const ty1 = cy + Math.sin(hourAngle) * (rClock - 26);
      const tx2 = cx + Math.cos(hourAngle) * (rClock - 8);
      const ty2 = cy + Math.sin(hourAngle) * (rClock - 8);
      const dTick = sdSegment(x, y, tx1, ty1, tx2, ty2) - 2.0;
      color = blend(color, [196, 181, 253, 255], smoothAlpha(dTick, 1.0));
    }

    // Orbital timezone ring
    const dOrbit = Math.abs(Math.hypot(x - cx, y - cy) - (rClock + 35)) - 1.0;
    color = blend(color, [56, 189, 248, 80], smoothAlpha(dOrbit, 1.2));

    // Clock Hands (pointing to 10:10 with active sweep)
    // Hour Hand: angle -140 deg, length 95px, thick 5.5px
    const hA = (-140 * Math.PI) / 180;
    const hx = cx + Math.cos(hA) * 95;
    const hy = cy + Math.sin(hA) * 95;
    const dH = sdSegment(x, y, cx, cy, hx, hy) - 5.5;
    color = blend(color, [255, 255, 255, 255], smoothAlpha(dH, 1.2));

    // Minute Hand: angle -35 deg, length 135px, thick 4.0px
    const mA = (-35 * Math.PI) / 180;
    const mx = cx + Math.cos(mA) * 135;
    const my = cy + Math.sin(mA) * 135;
    const dM = sdSegment(x, y, cx, cy, mx, my) - 4.0;
    color = blend(color, [255, 255, 255, 255], smoothAlpha(dM, 1.2));

    // Second Hand: electric cyan, angle 60 deg, length 150px, thick 2.0px
    const sA = (60 * Math.PI) / 180;
    const sx = cx + Math.cos(sA) * 150;
    const sy = cy + Math.sin(sA) * 150;
    const dS = sdSegment(x, y, cx - Math.cos(sA) * 30, cy - Math.sin(sA) * 30, sx, sy) - 2.0;
    color = blend(color, [56, 189, 248, 255], smoothAlpha(dS, 1.0));

    // Center pivot
    const dPivot = Math.hypot(x - cx, y - cy) - 9;
    color = blend(color, [139, 92, 246, 255], smoothAlpha(dPivot, 1.0));
    const dPivotDot = Math.hypot(x - cx, y - cy) - 4;
    color = blend(color, [255, 255, 255, 255], smoothAlpha(dPivotDot, 1.0));

    // 3. Left Side Badge Container
    const dBadgeBox = sdRoundBox(x, y, 205, 137, 230, 42, 21);
    if (dBadgeBox < 0) {
      color = blend(color, [255, 255, 255, 22], smoothAlpha(dBadgeBox, 1.0));
    }
    const dBadgeBorder = Math.abs(dBadgeBox) - 1.2;
    color = blend(color, [167, 139, 250, 160], smoothAlpha(dBadgeBorder, 1.0));

    // Live green indicator dot in badge
    const dGreenDot = Math.hypot(x - 116, y - 137) - 4.5;
    color = blend(color, [52, 211, 153, 255], smoothAlpha(dGreenDot, 1.0));

    // Badge text: TIME.SJI.ONE
    if (badgeMask[y * W + x]) {
      color = blend(color, [226, 232, 240, 255], 1.0);
    }

    // 4. Feature Pill Badges Backgrounds
    const dPill1 = sdRoundBox(x, y, 298, 412, 388, 36, 18);
    const dPill2 = sdRoundBox(x, y, 655, 412, 310, 36, 18);
    const dPill3 = sdRoundBox(x, y, 280, 472, 350, 36, 18);
    const dPill4 = sdRoundBox(x, y, 625, 472, 290, 36, 18);

    if (dPill1 < 0 || dPill2 < 0 || dPill3 < 0 || dPill4 < 0) {
      color = blend(color, [255, 255, 255, 16], 1.0);
    }
    const dPills = Math.min(Math.abs(dPill1), Math.abs(dPill2), Math.abs(dPill3), Math.abs(dPill4)) - 1.0;
    color = blend(color, [139, 92, 246, 80], smoothAlpha(dPills, 1.0));

    // Pill texts
    if (pillMask[y * W + x]) {
      color = blend(color, [196, 181, 253, 255], 1.0);
    }

    // 5. Main Title & Subtitle Text
    if (textMask[y * W + x]) {
      if (y < 280) {
        // Main title gradient: pure white with violet shimmer
        color = blend(color, [255, 255, 255, 255], 1.0);
      } else {
        // Subtitle: soft violet
        color = blend(color, [167, 139, 250, 255], 1.0);
      }
    }

    // 6. Bottom Accent Border
    if (y >= H - 6) {
      const gradBar = x / W;
      const rBar = Math.round(139 + (56 - 139) * gradBar);
      const gBar = Math.round(92 + (189 - 92) * gradBar);
      const bBar = Math.round(246 + (248 - 246) * gradBar);
      color = blend(color, [rBar, gBar, bBar, 255], 1.0);
    }

    return color;
  });
}

// --- Generate All Assets ---
console.log('🎨 Generating Favicons, App Icons, and Social Cards...');

const FAVICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of FAVICONS) {
  const buf = createPng(size, size, (x, y) => getClockIconPixel(x, y, size));
  fs.writeFileSync(path.join(publicDir, name), buf);
  console.log(`  ✅ Generated public/${name} (${size}x${size}, ${buf.length} bytes)`);
}

// Generate 1200x630 OG & Twitter Card images
const ogBuf = generateOgImage();
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogBuf);
console.log(`  ✅ Generated public/og-image.png (1200x630, ${ogBuf.length} bytes)`);

// twitter-card.png
fs.writeFileSync(path.join(publicDir, 'twitter-card.png'), ogBuf);
console.log(`  ✅ Generated public/twitter-card.png (1200x630, ${ogBuf.length} bytes)`);

console.log('🎉 All raster assets generated successfully!');
