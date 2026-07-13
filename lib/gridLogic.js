export const N_COLGROUPS = 11;
export const N_ROWGROUPS = 8;
export const COLS = N_COLGROUPS * 3;
export const ROWS = N_ROWGROUPS * 3;
export const TOTAL_ACTIVE = 440;

export const PLANES = [
  { key: 'H', label: 'Horizontal', role: 'H' },
  { key: 'TRIB1', label: 'Vertical Tribuna 1', role: 'TRIB1' },
  { key: 'TRIB2', label: 'Vertical Tribuna 2', role: 'TRIB2' },
  { key: 'GOL1', label: 'Vertical Gol 1', role: 'GOL1' },
  { key: 'GOL2', label: 'Vertical Gol 2', role: 'GOL2' },
];

export function makeEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function isActive(r, c) {
  const cm = c % 3;
  const rm = r % 3;
  if (cm === 1) return true;
  return rm === 1;
}

export function cellRole(r, c) {
  const cm = c % 3;
  const rm = r % 3;
  if (cm === 0) return 'GOL1';
  if (cm === 2) return 'GOL2';
  if (rm === 0) return 'TRIB1';
  if (rm === 2) return 'TRIB2';
  return 'H';
}

export function pointNumber(r, c) {
  const rg = Math.floor(r / 3);
  const cg = Math.floor(c / 3);
  return rg * N_COLGROUPS + cg + 1;
}

export function computeResults(grid) {
  const out = {};
  let filled = 0;
  PLANES.forEach((p) => {
    const values = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!isActive(r, c)) continue;
        if (cellRole(r, c) !== p.role) continue;
        const v = grid?.[r]?.[c];
        if (v !== null && v !== undefined && !Number.isNaN(v)) {
          values.push(v);
          filled++;
        }
      }
    }
    if (values.length === 0) {
      out[p.key] = { count: 0, expected: 88, media: null, maxima: null, minima: null, u1: null, u2: null };
      return;
    }
    const media = values.reduce((a, b) => a + b, 0) / values.length;
    const maxima = Math.max(...values);
    const minima = Math.min(...values);
    out[p.key] = {
      count: values.length,
      expected: 88,
      media,
      maxima,
      minima,
      u1: maxima ? minima / maxima : null,
      u2: media ? minima / media : null,
    };
  });
  return { planes: out, filled };
}

export function fmt(n, d = 1) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function fmtRatio(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toFixed(3);
}