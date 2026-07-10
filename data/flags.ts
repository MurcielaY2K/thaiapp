// Hand-composed pixel-art flags — same "char grid + palette" logic as the
// mascot sprites (see data/sprites.ts), so the whole app stays pixel-art.
// Flags are simplified to read at small sizes; emblems are approximated.
//
// Values are stored as short codes ('th', 'us', 'world'). Older profiles that
// stored the raw emoji still work — see EMOJI_TO_CODE + components/PixelFlag.

export interface PixelFlag {
  w: number;
  h: number;
  palette: Record<string, string>;
  rows: string[];
  outline?: boolean; // draw a thin ink border (default true; off for the round globe)
}

// Shared flag palette. Warm-white reads on the paper background via the outline.
const PAL: Record<string, string> = {
  r: '#d81e34', // red
  w: '#f7f6f2', // white
  b: '#1f47c4', // blue
  d: '#1a1b20', // black / ink
  y: '#f5c400', // gold / yellow
  g: '#0f9d51', // green
  o: '#ff7a1a', // orange / saffron
  c: '#6fb0e8', // light blue
  n: '#0e1c54', // navy
  s: '#8a5a2b', // brown / emblem
  '.': 'transparent',
};

// ── tiny grid compositor (runs once at module load) ─────────────────────────
type Grid = string[][];
const grid = (w: number, h: number, fill: string): Grid =>
  Array.from({ length: h }, () => Array(w).fill(fill));
const toRows = (g: Grid): string[] => g.map(r => r.join(''));

function hbands(w: number, bands: [string, number][]): Grid {
  const g: Grid = [];
  for (const [ch, n] of bands) for (let i = 0; i < n; i++) g.push(Array(w).fill(ch));
  return g;
}
function vbands(h: number, bands: [string, number][]): Grid {
  const row: string[] = [];
  for (const [ch, n] of bands) for (let i = 0; i < n; i++) row.push(ch);
  return Array.from({ length: h }, () => row.slice());
}
function rect(g: Grid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (g[y]?.[x] !== undefined) g[y][x] = ch;
}
function disc(g: Grid, cx: number, cy: number, r: number, ch: string) {
  for (let y = 0; y < g.length; y++)
    for (let x = 0; x < g[0].length; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r) g[y][x] = ch;
    }
}
function pts(g: Grid, list: [number, number][], ch: string) {
  for (const [x, y] of list) if (g[y]?.[x] !== undefined) g[y][x] = ch;
}

const W = 18, H = 12; // 3:2 field for most flags

function flag(g: Grid, outline = true): PixelFlag {
  return { w: g[0].length, h: g.length, palette: PAL, rows: toRows(g), outline };
}

// ── builders for the composed flags ─────────────────────────────────────────
function usa(): PixelFlag {
  const g = hbands(W, [['r', 2], ['w', 2], ['r', 2], ['w', 2], ['r', 2], ['w', 2]]);
  rect(g, 0, 0, 8, 6, 'n');
  pts(g, [[1, 1], [3, 1], [5, 1], [2, 2], [4, 2], [6, 2], [1, 3], [3, 3], [5, 3], [2, 4], [4, 4], [6, 4]], 'w');
  return flag(g);
}
function uk(): PixelFlag {
  const g = grid(W, H, 'b');
  // white diagonals
  for (let x = 0; x < W; x++) { const y = Math.round((x * (H - 1)) / (W - 1)); pts(g, [[x, y]], 'w'); pts(g, [[x, H - 1 - y]], 'w'); }
  rect(g, 7, 0, 11, H, 'w'); rect(g, 0, 4, W, 8, 'w'); // white cross
  rect(g, 8, 0, 10, H, 'r'); rect(g, 0, 5, W, 7, 'r'); // red cross
  return flag(g);
}
function japan(): PixelFlag {
  const g = grid(W, H, 'w'); disc(g, W / 2, H / 2, 3.3, 'r'); return flag(g);
}
function korea(): PixelFlag {
  const g = grid(W, H, 'w');
  disc(g, W / 2, H / 2, 3, 'r');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === 'r' && y >= Math.floor(H / 2)) g[y][x] = 'b';
  pts(g, [[2, 1], [3, 1], [2, 2]], 'd'); pts(g, [[15, 1], [14, 1], [15, 2]], 'd');
  pts(g, [[2, 10], [3, 10], [2, 9]], 'd'); pts(g, [[15, 10], [14, 10], [15, 9]], 'd');
  return flag(g);
}
function china(): PixelFlag {
  const g = grid(W, H, 'r');
  disc(g, 4, 4, 2, 'y');
  pts(g, [[7, 2], [8, 4], [8, 6], [7, 8]], 'y');
  return flag(g);
}
function india(): PixelFlag {
  const g = hbands(W, [['o', 4], ['w', 4], ['g', 4]]);
  disc(g, W / 2, 6, 1.6, 'n');
  return flag(g);
}
function australia(): PixelFlag {
  const g = grid(W, H, 'b');
  rect(g, 0, 0, 8, 5, 'b');
  rect(g, 3, 0, 5, 5, 'w'); rect(g, 0, 2, 8, 3, 'w');
  rect(g, 0, 2, 8, 3, 'r'); rect(g, 3, 0, 5, 5, 'r');
  pts(g, [[3, 9], [14, 3], [16, 6], [13, 8], [15, 9], [12, 5]], 'w');
  return flag(g);
}
function brazil(): PixelFlag {
  const g = grid(W, H, 'g');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = Math.abs(x + 0.5 - W / 2) / 8, dy = Math.abs(y + 0.5 - H / 2) / 5.2;
    if (dx + dy <= 1) g[y][x] = 'y';
  }
  disc(g, W / 2, H / 2, 2.4, 'n');
  return flag(g);
}
function canada(): PixelFlag {
  const g = grid(W, H, 'w');
  rect(g, 0, 0, 4, H, 'r'); rect(g, 14, 0, W, H, 'r');
  pts(g, [[9, 1], [8, 2], [9, 2], [10, 2], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
    [6, 4], [8, 4], [9, 4], [10, 4], [12, 4], [8, 5], [9, 5], [10, 5], [9, 6], [9, 7], [9, 8]], 'r');
  return flag(g);
}
function mexico(): PixelFlag {
  const g = vbands(H, [['g', 6], ['w', 6], ['r', 6]]);
  disc(g, W / 2, H / 2, 1.4, 's');
  return flag(g);
}
function singapore(): PixelFlag {
  const g = hbands(W, [['r', 6], ['w', 6]]);
  disc(g, 4, 3, 2.2, 'w'); disc(g, 5, 3, 1.8, 'r');
  pts(g, [[6, 1], [7, 2], [6, 3], [7, 4], [8, 3]], 'w');
  return flag(g);
}
function nordic(field: string, arm: string, inner?: string): PixelFlag {
  const g = grid(W, H, field);
  rect(g, 6, 0, 9, H, arm); rect(g, 0, 5, W, 8, arm);
  if (inner) { rect(g, 7, 0, 8, H, inner); rect(g, 0, 6, W, 7, inner); }
  return flag(g);
}
function swiss(): PixelFlag {
  const g = grid(12, 12, 'r');
  rect(g, 5, 3, 7, 9, 'w'); rect(g, 3, 5, 9, 7, 'w');
  return flag(g);
}
function portugal(): PixelFlag {
  const g = vbands(H, [['g', 7], ['r', 11]]);
  disc(g, 7, H / 2, 1.5, 'y');
  return flag(g);
}
function argentina(): PixelFlag {
  const g = hbands(W, [['c', 4], ['w', 4], ['c', 4]]);
  disc(g, W / 2, H / 2, 1.4, 'y');
  return flag(g);
}
function southAfrica(): PixelFlag {
  const g = grid(W, H, 'd');
  rect(g, 0, 0, W, 6, 'r'); rect(g, 0, 6, W, H, 'b');
  rect(g, 0, 5, W, 7, 'g');
  for (let y = 0; y < H; y++) { const t = Math.round(6 - Math.abs(y - 5.5)); rect(g, 0, y, Math.max(0, t), y + 1, 'd'); }
  rect(g, 0, 5, 7, 7, 'g');
  return flag(g);
}
function egypt(): PixelFlag {
  const g = hbands(W, [['r', 4], ['w', 4], ['d', 4]]);
  disc(g, W / 2, 6, 1.3, 'y');
  return flag(g);
}
function vietnam(): PixelFlag {
  const g = grid(W, H, 'r');
  pts(g, [[9, 2], [8, 4], [9, 4], [10, 4], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5],
    [8, 6], [9, 6], [10, 6], [8, 7], [10, 7]], 'y');
  return flag(g);
}
function philippines(): PixelFlag {
  const g = grid(W, H, 'r');
  rect(g, 0, 0, W, 6, 'b');
  for (let y = 0; y < H; y++) { const t = Math.round(7 - Math.abs(y - 5.5) * 1.1); rect(g, 0, y, Math.max(0, t), y + 1, 'w'); }
  disc(g, 2, H / 2, 1, 'y');
  return flag(g);
}
function malaysia(): PixelFlag {
  const g = hbands(W, [['r', 2], ['w', 2], ['r', 2], ['w', 2], ['r', 2], ['w', 2]]);
  rect(g, 0, 0, 8, 6, 'n');
  disc(g, 3, 3, 1.8, 'y'); disc(g, 4, 3, 1.4, 'n');
  pts(g, [[5, 3], [6, 2], [6, 4]], 'y');
  return flag(g);
}
function czech(): PixelFlag {
  const g = hbands(W, [['w', 6], ['r', 6]]);
  for (let y = 0; y < H; y++) { const t = Math.round(9 - Math.abs(y - 5.5) * 1.5); rect(g, 0, y, Math.max(0, t), y + 1, 'b'); }
  return flag(g);
}
function greece(): PixelFlag {
  const g = hbands(W, [['b', 2], ['w', 2], ['b', 2], ['w', 2], ['b', 2], ['w', 2]]);
  rect(g, 0, 0, 8, 6, 'b');
  rect(g, 3, 0, 5, 6, 'w'); rect(g, 0, 2, 8, 4, 'w');
  return flag(g);
}
function israel(): PixelFlag {
  const g = grid(W, H, 'w');
  rect(g, 0, 1, W, 3, 'b'); rect(g, 0, 9, W, 11, 'b');
  pts(g, [[9, 3], [7, 4], [11, 4], [7, 6], [11, 6], [9, 7], [8, 5], [10, 5], [9, 5]], 'b');
  return flag(g);
}
function world(): PixelFlag {
  const g = grid(14, 14, '.');
  disc(g, 7, 7, 6.6, 'b');
  // two rough landmasses: Americas (left), Africa/Eurasia (right)
  pts(g, [
    [3, 5], [4, 5], [3, 6], [4, 6], [4, 7], [5, 7], [4, 8], [5, 8], [5, 9], [4, 4],
    [8, 4], [9, 4], [8, 5], [9, 5], [10, 5], [9, 6], [10, 6], [11, 6],
    [9, 7], [10, 7], [8, 8], [9, 8], [10, 8], [9, 9], [8, 9],
  ], 'g');
  return flag(g, false);
}

// ── the flag set, in picker order ───────────────────────────────────────────
export const FLAGS: Record<string, PixelFlag> = {
  world: world(),
  th: flag(hbands(W, [['r', 2], ['w', 2], ['b', 4], ['w', 2], ['r', 2]])),
  us: usa(),
  gb: uk(),
  fr: flag(vbands(H, [['b', 6], ['w', 6], ['r', 6]])),
  de: flag(hbands(W, [['d', 4], ['r', 4], ['y', 4]])),
  jp: japan(),
  kr: korea(),
  cn: china(),
  in: india(),
  au: australia(),
  br: brazil(),
  ru: flag(hbands(W, [['w', 4], ['b', 4], ['r', 4]])),
  it: flag(vbands(H, [['g', 6], ['w', 6], ['r', 6]])),
  es: flag(hbands(W, [['r', 3], ['y', 6], ['r', 3]])),
  ca: canada(),
  mx: mexico(),
  sg: singapore(),
  nl: flag(hbands(W, [['r', 4], ['w', 4], ['b', 4]])),
  se: nordic('b', 'y'),
  no: nordic('r', 'w', 'b'),
  dk: nordic('r', 'w'),
  pl: flag(hbands(W, [['w', 6], ['r', 6]])),
  pt: portugal(),
  ar: argentina(),
  za: southAfrica(),
  eg: egypt(),
  ng: flag(vbands(H, [['g', 6], ['w', 6], ['g', 6]])),
  id: flag(hbands(W, [['r', 6], ['w', 6]])),
  vn: vietnam(),
  ph: philippines(),
  my: malaysia(),
  ua: flag(hbands(W, [['b', 6], ['y', 6]])),
  ch: swiss(),
  be: flag(vbands(H, [['d', 6], ['y', 6], ['r', 6]])),
  at: flag(hbands(W, [['r', 4], ['w', 4], ['r', 4]])),
  cz: czech(),
  hu: flag(hbands(W, [['r', 4], ['w', 4], ['g', 4]])),
  gr: greece(),
  il: israel(),
};

export const FLAG_ORDER: string[] = Object.keys(FLAGS);

// Backward-compat: profiles created before pixel flags stored the raw emoji.
export const EMOJI_TO_CODE: Record<string, string> = {
  '🌍': 'world', '🇹🇭': 'th', '🇺🇸': 'us', '🇬🇧': 'gb', '🇫🇷': 'fr', '🇩🇪': 'de',
  '🇯🇵': 'jp', '🇰🇷': 'kr', '🇨🇳': 'cn', '🇮🇳': 'in', '🇦🇺': 'au', '🇧🇷': 'br',
  '🇷🇺': 'ru', '🇮🇹': 'it', '🇪🇸': 'es', '🇨🇦': 'ca', '🇲🇽': 'mx', '🇸🇬': 'sg',
  '🇳🇱': 'nl', '🇸🇪': 'se', '🇳🇴': 'no', '🇩🇰': 'dk', '🇵🇱': 'pl', '🇵🇹': 'pt',
  '🇦🇷': 'ar', '🇿🇦': 'za', '🇪🇬': 'eg', '🇳🇬': 'ng', '🇮🇩': 'id', '🇻🇳': 'vn',
  '🇵🇭': 'ph', '🇲🇾': 'my', '🇺🇦': 'ua', '🇨🇭': 'ch', '🇧🇪': 'be', '🇦🇹': 'at',
  '🇨🇿': 'cz', '🇭🇺': 'hu', '🇬🇷': 'gr', '🇮🇱': 'il',
};

export const DEFAULT_FLAG = 'world';

export function resolveFlag(value: string): PixelFlag | null {
  if (FLAGS[value]) return FLAGS[value];
  const code = EMOJI_TO_CODE[value];
  return code ? FLAGS[code] ?? null : null;
}
