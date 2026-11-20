#!/usr/bin/env node
/**
 * Gera os ícones PNG do PWA a partir do logo mark do produto
 * (camisa branca do lucide `Shirt` sobre quadrado preto arredondado — o mesmo
 * mark usado no header em `app/page.tsx`).
 *
 * Zero dependências: rasterizador de path SVG + encoder PNG escritos à mão
 * usando só `zlib` do Node. Rodar apenas quando o mark mudar:
 *
 *     npm run icons --workspace=@racha/web
 *
 * Os PNGs gerados são versionados no repositório, então nem o build nem o
 * runtime dependem deste script.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WEB_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Path do ícone `Shirt` do lucide-react (viewBox 24x24, stroke 2, joins redondos). */
const SHIRT_PATH =
  "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z";
const SHIRT_VIEWBOX = 24;
const SHIRT_STROKE = 2;

const BG = [0x18, 0x18, 0x1b]; // ≈ --primary oklch(0.205 0 0)
const FG = [0xfa, 0xfa, 0xfa]; // ≈ --primary-foreground oklch(0.985 0 0)

// ---------------------------------------------------------------------------
// Parser de path SVG → polilinhas
// ---------------------------------------------------------------------------

function tokenize(d) {
  return d.match(/[astvzqmhlc]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/gi) ?? [];
}

/** Converte um arco elíptico SVG em pontos amostrados. */
function sampleArc(x1, y1, rx, ry, phiDeg, largeArc, sweep, x2, y2, steps) {
  if (rx === 0 || ry === 0) return [[x2, y2]];
  const phi = (phiDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx2 = (x1 - x2) / 2;
  const dy2 = (y1 - y2) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  let rxa = Math.abs(rx);
  let rya = Math.abs(ry);
  const lambda = (x1p * x1p) / (rxa * rxa) + (y1p * y1p) / (rya * rya);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rxa *= s;
    rya *= s;
  }

  const num = rxa * rxa * rya * rya - rxa * rxa * y1p * y1p - rya * rya * x1p * x1p;
  const den = rxa * rxa * y1p * y1p + rya * rya * x1p * x1p;
  let coef = Math.sqrt(Math.max(0, num / den));
  if (largeArc === sweep) coef = -coef;
  const cxp = (coef * rxa * y1p) / rya;
  const cyp = (-coef * rya * x1p) / rxa;
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };
  const theta1 = angle(1, 0, (x1p - cxp) / rxa, (y1p - cyp) / rya);
  let delta = angle(
    (x1p - cxp) / rxa,
    (y1p - cyp) / rya,
    (-x1p - cxp) / rxa,
    (-y1p - cyp) / rya,
  );
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const out = [];
  for (let i = 1; i <= steps; i++) {
    const t = theta1 + (delta * i) / steps;
    out.push([
      cx + rxa * Math.cos(t) * cosPhi - rya * Math.sin(t) * sinPhi,
      cy + rxa * Math.cos(t) * sinPhi + rya * Math.sin(t) * cosPhi,
    ]);
  }
  return out;
}

function sampleCubic(p0, p1, p2, p3, steps) {
  const out = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

function sampleQuad(p0, p1, p2, steps) {
  return sampleCubic(
    p0,
    [p0[0] + (2 / 3) * (p1[0] - p0[0]), p0[1] + (2 / 3) * (p1[1] - p0[1])],
    [p2[0] + (2 / 3) * (p1[0] - p2[0]), p2[1] + (2 / 3) * (p1[1] - p2[1])],
    p2,
    steps,
  );
}

/** Achata um path SVG em subpaths de pontos (array de arrays de [x, y]). */
function flattenPath(d, steps = 16) {
  const t = tokenize(d);
  const subpaths = [];
  let current = null;
  let cursor = [0, 0];
  let start = [0, 0];
  let prevCubicCtrl = null;
  let prevQuadCtrl = null;
  let cmd = null;
  let i = 0;
  const num = () => Number(t[i++]);

  const push = (pts) => {
    for (const p of pts) current.push(p);
    cursor = current[current.length - 1];
  };

  while (i < t.length) {
    if (/[a-z]/i.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase();
    const base = () => (rel ? cursor : [0, 0]);
    const abs = (x, y) => [base()[0] + x, base()[1] + y];

    switch (cmd.toUpperCase()) {
      case "M": {
        const p = abs(num(), num());
        current = [p];
        subpaths.push(current);
        cursor = p;
        start = p;
        cmd = rel ? "l" : "L";
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      }
      case "L":
        push([abs(num(), num())]);
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      case "H":
        push([[rel ? cursor[0] + num() : num(), cursor[1]]]);
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      case "V":
        push([[cursor[0], rel ? cursor[1] + num() : num()]]);
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      case "C": {
        const p0 = cursor;
        const c1 = abs(num(), num());
        const c2 = abs(num(), num());
        const p3 = abs(num(), num());
        push(sampleCubic(p0, c1, c2, p3, steps));
        prevCubicCtrl = c2;
        prevQuadCtrl = null;
        break;
      }
      case "S": {
        const p0 = cursor;
        const c1 = prevCubicCtrl
          ? [2 * p0[0] - prevCubicCtrl[0], 2 * p0[1] - prevCubicCtrl[1]]
          : p0;
        const c2 = abs(num(), num());
        const p3 = abs(num(), num());
        push(sampleCubic(p0, c1, c2, p3, steps));
        prevCubicCtrl = c2;
        prevQuadCtrl = null;
        break;
      }
      case "Q": {
        const p0 = cursor;
        const c1 = abs(num(), num());
        const p2 = abs(num(), num());
        push(sampleQuad(p0, c1, p2, steps));
        prevQuadCtrl = c1;
        prevCubicCtrl = null;
        break;
      }
      case "T": {
        const p0 = cursor;
        const c1 = prevQuadCtrl
          ? [2 * p0[0] - prevQuadCtrl[0], 2 * p0[1] - prevQuadCtrl[1]]
          : p0;
        const p2 = abs(num(), num());
        push(sampleQuad(p0, c1, p2, steps));
        prevQuadCtrl = c1;
        prevCubicCtrl = null;
        break;
      }
      case "A": {
        const p0 = cursor;
        const rx = num();
        const ry = num();
        const rot = num();
        const large = num() !== 0;
        const sweep = num() !== 0;
        const p = abs(num(), num());
        push(sampleArc(p0[0], p0[1], rx, ry, rot, large, sweep, p[0], p[1], steps));
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      }
      case "Z":
        current.push(start);
        cursor = start;
        prevCubicCtrl = prevQuadCtrl = null;
        break;
      default:
        throw new Error(`Comando de path não suportado: ${cmd}`);
    }
  }
  return subpaths;
}

// ---------------------------------------------------------------------------
// Rasterização (máscara de cobertura com supersampling 4x4)
// ---------------------------------------------------------------------------

const SS = 4; // subamostras por eixo → 16 por pixel

function createMask(size) {
  // 1 bit por subamostra (16 bits/pixel) → união de primitivas sem contar duas vezes.
  return new Uint16Array(size * size);
}

function maskToAlpha(mask, size) {
  const alpha = new Uint8Array(size * size);
  for (let i = 0; i < mask.length; i++) {
    let bits = mask[i];
    let n = 0;
    while (bits) {
      n += bits & 1;
      bits >>= 1;
    }
    alpha[i] = Math.round((n / (SS * SS)) * 255);
  }
  return alpha;
}

function fillPrimitive(mask, size, bbox, test) {
  const x0 = Math.max(0, Math.floor(bbox[0]));
  const y0 = Math.max(0, Math.floor(bbox[1]));
  const x1 = Math.min(size - 1, Math.ceil(bbox[2]));
  const y1 = Math.min(size - 1, Math.ceil(bbox[3]));
  const step = 1 / SS;
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      let bits = mask[py * size + px];
      if (bits === 0xffff) continue;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const bit = 1 << (sy * SS + sx);
          if (bits & bit) continue;
          if (test(px + (sx + 0.5) * step, py + (sy + 0.5) * step)) bits |= bit;
        }
      }
      mask[py * size + px] = bits;
    }
  }
}

function distToSegment(x, y, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((x - ax) * dx + (y - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
}

/** Traça polilinhas com caps/joins redondos (igual ao lucide). */
function strokePolylines(mask, size, polylines, halfWidth) {
  for (const pts of polylines) {
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k];
      const [bx, by] = pts[k + 1];
      fillPrimitive(
        mask,
        size,
        [
          Math.min(ax, bx) - halfWidth,
          Math.min(ay, by) - halfWidth,
          Math.max(ax, bx) + halfWidth,
          Math.max(ay, by) + halfWidth,
        ],
        (x, y) => distToSegment(x, y, ax, ay, bx, by) <= halfWidth,
      );
    }
  }
}

function fillRoundedRect(mask, size, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  fillPrimitive(mask, size, [x, y, x + w, y + h], (px, py) => {
    const dx = Math.max(x + rr - px, 0, px - (x + w - rr));
    const dy = Math.max(y + rr - py, 0, py - (y + h - rr));
    return Math.hypot(dx, dy) <= rr;
  });
}

// ---------------------------------------------------------------------------
// Encoder PNG (RGBA, sem filtro, deflate do zlib)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtro "none"
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Composição do mark
// ---------------------------------------------------------------------------

/**
 * @param {number} size      lado do PNG em px
 * @param {number} iconScale fração do lado ocupada pela camisa
 * @param {number} radius    fração do lado usada como raio do canto (0 = full-bleed)
 */
function renderIcon(size, { iconScale, radius }) {
  const bgMask = createMask(size);
  fillRoundedRect(bgMask, size, 0, 0, size, size, radius * size);
  const bgAlpha = maskToAlpha(bgMask, size);

  const scale = (size * iconScale) / SHIRT_VIEWBOX;
  const offset = (size - size * iconScale) / 2;
  const polylines = flattenPath(SHIRT_PATH, 24).map((pts) =>
    pts.map(([x, y]) => [offset + x * scale, offset + y * scale]),
  );
  const fgMask = createMask(size);
  strokePolylines(fgMask, size, polylines, (SHIRT_STROKE * scale) / 2);
  const fgAlpha = maskToAlpha(fgMask, size);

  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const a = bgAlpha[i] / 255;
    const f = fgAlpha[i] / 255;
    // camisa sobre o fundo; fora do fundo o pixel é transparente
    const mix = (c1, c2) => Math.round((c1 * (1 - f) + c2 * f) * a);
    rgba[i * 4] = mix(BG[0], FG[0]);
    rgba[i * 4 + 1] = mix(BG[1], FG[1]);
    rgba[i * 4 + 2] = mix(BG[2], FG[2]);
    rgba[i * 4 + 3] = Math.round(a * 255);
  }
  return encodePng(size, rgba);
}

const TARGETS = [
  // ícones "any": quadrado preto arredondado, igual ao header
  { file: "public/icons/icon-192.png", size: 192, iconScale: 0.56, radius: 0.2 },
  { file: "public/icons/icon-512.png", size: 512, iconScale: 0.56, radius: 0.2 },
  // maskable: full-bleed, camisa dentro da zona segura (80%)
  { file: "public/icons/icon-maskable-512.png", size: 512, iconScale: 0.44, radius: 0 },
  // apple-touch-icon: o iOS arredonda sozinho, então vai full-bleed
  { file: "app/apple-icon.png", size: 180, iconScale: 0.56, radius: 0 },
];

for (const { file, size, iconScale, radius } of TARGETS) {
  const png = renderIcon(size, { iconScale, radius });
  const out = join(WEB_DIR, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
  console.log(`${file} — ${size}x${size}, ${png.length} bytes`);
}
