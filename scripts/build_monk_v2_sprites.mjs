import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'assets/sprites/monk-preview/monk-sheet-preview-v2.png');
const OUT_DIR = path.join(ROOT, 'assets/sprites/monk-new');
const PREVIEW_DIR = path.join(ROOT, 'assets/sprites/monk-preview');
const FRAME_W = 320;
const FRAME_H = 208;
const BASELINE_Y = 178;
const BODY_X = 160;

const ROWS = [
  {
    key: 'idle',
    count: 5,
    y0: 16,
    y1: 154,
    preserveSmallEdgePixels: true,
    manualFrames: [
      { x0: 150, y0: 18, x1: 282, y1: 176, footY: 166, bodyCx: 215 },
      { x0: 298, y0: 18, x1: 410, y1: 176, footY: 166, bodyCx: 354 },
      { x0: 440, y0: 18, x1: 562, y1: 176, footY: 166, bodyCx: 500 },
      { x0: 582, y0: 18, x1: 698, y1: 176, footY: 166, bodyCx: 638 },
      { x0: 724, y0: 18, x1: 844, y1: 176, footY: 166, bodyCx: 784 },
    ],
  },
  { key: 'run', count: 8, y0: 150, y1: 304 },
  { key: 'attack', count: 8, y0: 306, y1: 455 },
  { key: 'attack-heavy', count: 7, y0: 452, y1: 594 },
  { key: 'cast', count: 7, y0: 618, y1: 782 },
  { key: 'hurt', count: 3, y0: 776, y1: 900 },
  { key: 'death', count: 4, y0: 900, y1: 1018, selectLeftmost: true, lastRightPad: 115 },
];

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    crc32.table = table;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function readChunk(buf, offset) {
  const length = buf.readUInt32BE(offset);
  const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
  const data = buf.subarray(offset + 8, offset + 8 + length);
  return { length, type, data, next: offset + 12 + length };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(file) {
  const buf = fs.readFileSync(file);
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error('Not a PNG');
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  let bitDepth = 0;
  const idat = [];
  while (offset < buf.length) {
    const chunk = readChunk(buf, offset);
    offset = chunk.next;
    if (chunk.type === 'IHDR') {
      width = chunk.data.readUInt32BE(0);
      height = chunk.data.readUInt32BE(4);
      bitDepth = chunk.data[8];
      colorType = chunk.data[9];
    } else if (chunk.type === 'IDAT') {
      idat.push(chunk.data);
    } else if (chunk.type === 'IEND') {
      break;
    }
  }
  if (bitDepth !== 8 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`Unsupported PNG color type ${colorType} bit depth ${bitDepth}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  let inPos = 0;
  let prev = Buffer.alloc(stride);
  let cur = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[inPos++];
    raw.copy(cur, 0, inPos, inPos + stride);
    inPos += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x] || 0;
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      if (filter === 1) cur[x] = (cur[x] + left) & 255;
      else if (filter === 2) cur[x] = (cur[x] + up) & 255;
      else if (filter === 3) cur[x] = (cur[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) cur[x] = (cur[x] + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter}`);
    }
    for (let x = 0; x < width; x++) {
      const si = x * bpp;
      const di = (y * width + x) * 4;
      pixels[di] = cur[si];
      pixels[di + 1] = cur[si + 1];
      pixels[di + 2] = cur[si + 2];
      pixels[di + 3] = colorType === 6 ? cur[si + 3] : 255;
    }
    [prev, cur] = [cur, prev];
  }
  return { width, height, pixels };
}

function encodePng(width, height, pixels) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rows[pos++] = 0;
    pixels.copy(rows, pos, y * width * 4, (y + 1) * width * 4);
    pos += width * 4;
  }
  const chunks = [];
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  chunks.push(makeChunk('IHDR', ihdr));
  chunks.push(makeChunk('IDAT', zlib.deflateSync(rows, { level: 9 })));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));
  return Buffer.concat([SIGNATURE, ...chunks]);
}

function makeChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  name.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return out;
}

function isGreenBg(r, g, b, a = 255) {
  if (a < 8) return true;
  return g > 190 && r < 95 && b < 95 && g - r > 90 && g - b > 90;
}

function isStrictGreenBg(r, g, b, a = 255) {
  if (a < 8) return true;
  return g > 210 && r < 70 && b < 70 && g - r > 135 && g - b > 135;
}

function isForeground(img, x, y) {
  const i = (y * img.width + x) * 4;
  return !isGreenBg(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3]);
}

function componentsInRow(img, row) {
  const w = img.width;
  const h = row.y1 - row.y0;
  const seen = new Uint8Array(w * h);
  const comps = [];
  const qx = [];
  const qy = [];
  for (let yy = 0; yy < h; yy++) {
    const y = row.y0 + yy;
    for (let x = 95; x < w; x++) {
      const idx = yy * w + x;
      if (seen[idx] || !isForeground(img, x, y)) continue;
      let head = 0;
      qx.length = 0;
      qy.length = 0;
      qx.push(x);
      qy.push(y);
      seen[idx] = 1;
      let x0 = x, x1 = x, y0 = y, y1 = y, area = 0;
      while (head < qx.length) {
        const cx = qx[head];
        const cy = qy[head++];
        area++;
        if (cx < x0) x0 = cx;
        if (cx > x1) x1 = cx;
        if (cy < y0) y0 = cy;
        if (cy > y1) y1 = cy;
        const nexts = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const [nx, ny] of nexts) {
          if (nx < 95 || nx >= w || ny < row.y0 || ny >= row.y1) continue;
          const ni = (ny - row.y0) * w + nx;
          if (!seen[ni] && isForeground(img, nx, ny)) {
            seen[ni] = 1;
            qx.push(nx);
            qy.push(ny);
          }
        }
      }
      comps.push({
        x0, x1, y0, y1, area,
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        w: x1 - x0 + 1,
        h: y1 - y0 + 1,
        pixels: qx.map((px, i) => [px, qy[i]]),
      });
    }
  }
  return comps;
}

function pickMainComponents(comps, count, row) {
  const candidates = comps
    .filter(c => c.area >= 260 && c.w >= 16 && c.h >= 24 && c.x1 >= 105)
    .sort((a, b) => b.area - a.area);
  if (row.selectLeftmost) {
    return candidates
      .sort((a, b) => a.cx - b.cx)
      .slice(0, count)
      .sort((a, b) => a.cx - b.cx);
  }
  const chosen = [];
  for (const comp of candidates) {
    if (chosen.some(c => Math.abs(c.cx - comp.cx) < 55)) continue;
    chosen.push(comp);
    if (chosen.length === count) break;
  }
  return chosen.sort((a, b) => a.cx - b.cx);
}

function clusterFrames(comps, mains, row) {
  const clusters = mains.map(main => ({
    x0: main.x0,
    x1: main.x1,
    y0: main.y0,
    y1: main.y1,
    parts: [main],
    main,
  }));
  const filtered = comps.filter(c => c.area >= 8 && c.x1 >= 105 && c.y0 >= row.y0 && c.y1 < row.y1);
  for (const comp of filtered) {
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < mains.length; i++) {
      const d = Math.abs(comp.cx - mains[i].cx);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    const leftBound = nearest === 0 ? 95 : (mains[nearest - 1].cx + mains[nearest].cx) / 2;
    const rightBound = nearest === mains.length - 1
      ? (row.lastRightPad ? mains[nearest].cx + row.lastRightPad : Infinity)
      : (mains[nearest].cx + mains[nearest + 1].cx) / 2;
    if (comp.cx < leftBound || comp.cx >= rightBound) continue;
    if (comp.x0 < 115 && comp.area < 1500) continue;
    if (comp.x1 < mains[nearest].x0 - 55 && comp.cx < mains[nearest].cx - 80) continue;
    if (row.key === 'run' && comp.y1 < mains[nearest].y0 - 10) continue;
    const cl = clusters[nearest];
    cl.x0 = Math.min(cl.x0, comp.x0);
    cl.x1 = Math.max(cl.x1, comp.x1);
    cl.y0 = Math.min(cl.y0, comp.y0);
    cl.y1 = Math.max(cl.y1, comp.y1);
    cl.parts.push(comp);
  }
  return clusters;
}

function cropToFrame(img, box, main, parts, row) {
  const pad = 8;
  const x0 = Math.max(0, Math.floor(box.x0 - pad));
  const y0 = Math.max(0, Math.floor(box.y0 - pad));
  const x1 = Math.min(img.width - 1, Math.ceil(box.x1 + pad));
  const y1 = Math.min(img.height - 1, Math.ceil(box.y1 + pad));
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;
  const crop = Buffer.alloc(cw * ch * 4);
  if (row.preserveSmallEdgePixels) {
    for (let sy = y0; sy <= y1; sy++) {
      for (let sx = x0; sx <= x1; sx++) {
        const si = (sy * img.width + sx) * 4;
        if (isStrictGreenBg(img.pixels[si], img.pixels[si + 1], img.pixels[si + 2], img.pixels[si + 3])) continue;
        const di = ((sy - y0) * cw + (sx - x0)) * 4;
        crop[di] = img.pixels[si];
        crop[di + 1] = img.pixels[si + 1];
        crop[di + 2] = img.pixels[si + 2];
        crop[di + 3] = img.pixels[si + 3];
      }
    }
  } else {
    for (const part of parts) {
      for (const [sx, sy] of part.pixels) {
        if (sx < x0 || sx > x1 || sy < y0 || sy > y1) continue;
        const si = (sy * img.width + sx) * 4;
        const di = ((sy - y0) * cw + (sx - x0)) * 4;
        crop[di] = img.pixels[si];
        crop[di + 1] = img.pixels[si + 1];
        crop[di + 2] = img.pixels[si + 2];
        crop[di + 3] = img.pixels[si + 3];
      }
    }
  }
  trimAlphaSpecks(crop, cw, ch, row.preserveSmallEdgePixels ? isStrictGreenBg : isGreenBg);
  removePureGreenResidue(crop, cw, ch);
  removeGreenFringe(crop, cw, ch, row.preserveSmallEdgePixels);
  const out = Buffer.alloc(FRAME_W * FRAME_H * 4);
  const footSrcY = main.y1 - y0;
  const mainCenterSrcX = (main.x0 + main.x1) / 2 - x0;
  const dx = Math.round(BODY_X - mainCenterSrcX);
  const dy = Math.round(BASELINE_Y - footSrcY);
  blit(crop, cw, ch, out, FRAME_W, FRAME_H, dx, dy);
  return out;
}

function cropManualFrame(img, spec, row) {
  const cw = spec.x1 - spec.x0 + 1;
  const ch = spec.y1 - spec.y0 + 1;
  const crop = Buffer.alloc(cw * ch * 4);
  for (let sy = spec.y0; sy <= spec.y1; sy++) {
    for (let sx = spec.x0; sx <= spec.x1; sx++) {
      const si = (sy * img.width + sx) * 4;
      if (isStrictGreenBg(img.pixels[si], img.pixels[si + 1], img.pixels[si + 2], img.pixels[si + 3])) continue;
      const di = ((sy - spec.y0) * cw + (sx - spec.x0)) * 4;
      crop[di] = img.pixels[si];
      crop[di + 1] = img.pixels[si + 1];
      crop[di + 2] = img.pixels[si + 2];
      crop[di + 3] = img.pixels[si + 3];
    }
  }
  trimAlphaSpecks(crop, cw, ch, isStrictGreenBg);
  removePureGreenResidue(crop, cw, ch);
  const out = Buffer.alloc(FRAME_W * FRAME_H * 4);
  const dx = Math.round(BODY_X - (spec.bodyCx - spec.x0));
  const dy = Math.round(BASELINE_Y - (spec.footY - spec.y0));
  blit(crop, cw, ch, out, FRAME_W, FRAME_H, dx, dy);
  if (row.key === 'idle') restoreIdleFeet(img, out, spec, dx, dy);
  return out;
}

function restoreIdleFeet(img, out, spec, dx, dy) {
  for (let sy = spec.footY - 18; sy <= spec.footY + 6; sy++) {
    for (let sx = spec.x0; sx <= spec.x1; sx++) {
      const si = (sy * img.width + sx) * 4;
      const r = img.pixels[si];
      const g = img.pixels[si + 1];
      const b = img.pixels[si + 2];
      const a = img.pixels[si + 3];
      if (isGreenBg(r, g, b, a)) continue;
      const footLike = r > 120 && g > 55 && b < 95;
      const goldLike = r > 135 && g > 95 && b < 80;
      const darkOutline = r < 80 && g < 80 && b < 70;
      if (!footLike && !goldLike && !darkOutline) continue;
      const tx = sx - spec.x0 + dx;
      const ty = sy - spec.y0 + dy;
      if (tx < 0 || tx >= FRAME_W || ty < 0 || ty >= FRAME_H) continue;
      const di = (ty * FRAME_W + tx) * 4;
      out[di] = r;
      out[di + 1] = g;
      out[di + 2] = b;
      out[di + 3] = a;
    }
  }
}

function removeConnectedGreen(pixels, w, h) {
  const seen = new Uint8Array(w * h);
  const q = [];
  const enqueue = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (seen[idx]) return;
    const pi = idx * 4;
    if (!isGreenBg(pixels[pi], pixels[pi + 1], pixels[pi + 2], pixels[pi + 3])) return;
    seen[idx] = 1;
    q.push(idx);
  };
  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }
  let head = 0;
  while (head < q.length) {
    const idx = q[head++];
    const x = idx % w;
    const y = Math.floor(idx / w);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
  for (let idx = 0; idx < seen.length; idx++) {
    if (!seen[idx]) continue;
    const pi = idx * 4;
    pixels[pi] = 0;
    pixels[pi + 1] = 0;
    pixels[pi + 2] = 0;
    pixels[pi + 3] = 0;
  }
}

function trimAlphaSpecks(pixels, w, h, bgFn = isGreenBg) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (pixels[i + 3] < 8 || bgFn(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 0;
      }
    }
  }
}

function removePureGreenResidue(pixels, w, h) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (pixels[i + 3] === 0) continue;
      if (!isGreenBg(pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3])) continue;
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 0;
    }
  }
}

function removeGreenFringe(pixels, w, h, preserveEdges = false) {
  const kill = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (pixels[i + 3] === 0) continue;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const looksLikeBgSpill = g > 125 && r < 130 && b < 130 && g - r > 42 && g - b > 42;
      if (!looksLikeBgSpill || preserveEdges) continue;
      if (touchesTransparent(pixels, w, h, x, y, 2)) kill[y * w + x] = 1;
    }
  }
  for (let idx = 0; idx < kill.length; idx++) {
    if (!kill[idx]) continue;
    const i = idx * 4;
    pixels[i] = 0;
    pixels[i + 1] = 0;
    pixels[i + 2] = 0;
    pixels[i + 3] = 0;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (pixels[i + 3] === 0) continue;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const mildSpill = g > 80 && g - r > 20 && g - b > 20 && touchesTransparent(pixels, w, h, x, y, 2);
      if (!mildSpill) continue;
      const newG = Math.max(r, b) + 10;
      pixels[i + 1] = Math.min(g, newG);
    }
  }
}

function touchesTransparent(pixels, w, h, x, y, radius) {
  for (let yy = y - radius; yy <= y + radius; yy++) {
    for (let xx = x - radius; xx <= x + radius; xx++) {
      if (xx < 0 || xx >= w || yy < 0 || yy >= h) return true;
      if (xx === x && yy === y) continue;
      if (pixels[(yy * w + xx) * 4 + 3] === 0) return true;
    }
  }
  return false;
}

function blit(src, sw, sh, dst, dw, dh, dx, dy) {
  for (let y = 0; y < sh; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= dh) continue;
    for (let x = 0; x < sw; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= dw) continue;
      const si = (y * sw + x) * 4;
      const a = src[si + 3];
      if (a === 0) continue;
      const di = (ty * dw + tx) * 4;
      dst[di] = src[si];
      dst[di + 1] = src[si + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = a;
    }
  }
}

function writeStrip(key, frames) {
  const width = FRAME_W * frames.length;
  const height = FRAME_H;
  const strip = Buffer.alloc(width * height * 4);
  frames.forEach((frame, fi) => {
    for (let y = 0; y < FRAME_H; y++) {
      for (let x = 0; x < FRAME_W; x++) {
        const si = (y * FRAME_W + x) * 4;
        const di = (y * width + fi * FRAME_W + x) * 4;
        strip[di] = frame[si];
        strip[di + 1] = frame[si + 1];
        strip[di + 2] = frame[si + 2];
        strip[di + 3] = frame[si + 3];
      }
    }
  });
  fs.writeFileSync(path.join(OUT_DIR, `${key}.png`), encodePng(width, height, strip));
}

function makeContact(actionFrames) {
  const gap = 14;
  const labelW = 150;
  const width = labelW + Math.max(...ROWS.map(row => row.count)) * (FRAME_W + gap) + gap;
  const height = ROWS.length * (FRAME_H + gap) + gap;
  const canvas = Buffer.alloc(width * height * 4, 0);
  for (let i = 0; i < ROWS.length; i++) {
    const row = ROWS[i];
    const frames = actionFrames[row.key];
    const y0 = gap + i * (FRAME_H + gap);
    drawLabel(canvas, width, height, row.key, 18, y0 + 18);
    frames.forEach((frame, fi) => {
      const x0 = labelW + gap + fi * (FRAME_W + gap);
      const y = y0;
      blit(frame, FRAME_W, FRAME_H, canvas, width, height, x0, y);
    });
  }
  fs.writeFileSync(path.join(PREVIEW_DIR, 'monk-animation-contact-v2.png'), encodePng(width, height, canvas));
}

function drawLabel(canvas, width, height, text, x, y) {
  // Tiny block label: enough to mark rows in the QA sheet without adding dependencies.
  const color = [255, 255, 255, 255];
  for (let i = 0; i < text.length; i++) {
    const ox = x + i * 7;
    for (let yy = 0; yy < 10; yy++) {
      for (let xx = 0; xx < 5; xx++) {
        if (yy === 0 || yy === 9 || xx === 0 || xx === 4) setPixel(canvas, width, height, ox + xx, y + yy, color);
      }
    }
  }
}

function setPixel(canvas, width, height, x, y, rgba) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const i = (y * width + x) * 4;
  canvas[i] = rgba[0];
  canvas[i + 1] = rgba[1];
  canvas[i + 2] = rgba[2];
  canvas[i + 3] = rgba[3];
}

function alphaStats(file) {
  const img = decodePng(file);
  let alpha = 0;
  let greenOpaque = 0;
  for (let i = 0; i < img.pixels.length; i += 4) {
    if (img.pixels[i + 3] > 0) {
      alpha++;
      if (isGreenBg(img.pixels[i], img.pixels[i + 1], img.pixels[i + 2], img.pixels[i + 3])) greenOpaque++;
    }
  }
  return { width: img.width, height: img.height, alpha, greenOpaque };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(PREVIEW_DIR, { recursive: true });

const sheet = decodePng(SOURCE);
console.log(`source ${sheet.width}x${sheet.height}`);
const actionFrames = {};
const debug = {};
for (const row of ROWS) {
  if (row.manualFrames) {
    actionFrames[row.key] = row.manualFrames.map(spec => cropManualFrame(sheet, spec, row));
    writeStrip(row.key, actionFrames[row.key]);
    debug[row.key] = row.manualFrames.map(spec => ({
      manual: [spec.x0, spec.y0, spec.x1, spec.y1],
      footY: spec.footY,
      bodyCx: spec.bodyCx,
    }));
    continue;
  }
  const comps = componentsInRow(sheet, row);
  const mains = pickMainComponents(comps, row.count, row);
  if (mains.length !== row.count) {
    console.error(`${row.key}: expected ${row.count} main components, found ${mains.length}`);
    console.error(comps.filter(c => c.area >= 180).sort((a, b) => b.area - a.area).slice(0, 20));
    process.exitCode = 1;
    continue;
  }
  const clusters = clusterFrames(comps, mains, row);
  actionFrames[row.key] = clusters.map(cl => cropToFrame(sheet, cl, cl.main, cl.parts, row));
  writeStrip(row.key, actionFrames[row.key]);
  debug[row.key] = clusters.map(cl => ({
    main: [Math.round(cl.main.x0), Math.round(cl.main.y0), Math.round(cl.main.x1), Math.round(cl.main.y1)],
    box: [Math.round(cl.x0), Math.round(cl.y0), Math.round(cl.x1), Math.round(cl.y1)],
    parts: cl.parts.length,
    partBoxes: cl.parts.map(part => [Math.round(part.x0), Math.round(part.y0), Math.round(part.x1), Math.round(part.y1), part.area]).slice(0, 12),
  }));
}
makeContact(actionFrames);
fs.writeFileSync(path.join(PREVIEW_DIR, 'monk-v2-frame-debug.json'), JSON.stringify(debug, null, 2));
for (const row of ROWS) {
  const file = path.join(OUT_DIR, `${row.key}.png`);
  if (fs.existsSync(file)) console.log(row.key, alphaStats(file));
}
console.log(`contact ${path.join(PREVIEW_DIR, 'monk-animation-contact-v2.png')}`);
