import { N_COLGROUPS, ROWS, COLS, isActive, cellRole, pointNumber, computeResults } from '../lib/gridLogic';
export default function GridInput({ grid, onChange, filled, torres, onTorresChange }) {
  const results = computeResults(grid);
  function handleInput(r, c, raw) {
    const v = raw.trim() === '' ? null : parseFloat(raw.replace(',', '.'));
    onChange(r, c, Number.isNaN(v) ? null : v);
  }

  function handlePaste(e, startR, startC) {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n')) return;
    e.preventDefault();
    const rows = text.replace(/\r/g, '').split('\n').filter((x) => x.length);
    rows.forEach((rowText, ri) => {
      const vals = rowText.split(/\t|,(?!\d)/);
      vals.forEach((val, ci) => {
        const r = startR + ri;
        const c = startC + ci;
        if (r >= ROWS || c >= COLS) return;
        const num = parseFloat(val.trim().replace(',', '.'));
        if (Number.isNaN(num)) return;
        onChange(r, c, num);
      });
    });
  }

  return (
    <div className="border border-lineStrong rounded-lg bg-white">
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-line text-[11px] text-muted flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-lineStrong bg-white" /> Horizontal (H)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-lineStrong bg-[#FBFDFC]" /> Vertical Tribunas (T1/T2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm border border-lineStrong bg-[#F6FBFA]" /> Vertical Goles (G1/G2)
        </span>
        <span className="ml-auto font-mono font-semibold text-teal-700">{filled} / 440 valores cargados</span>
      </div>

      <div className="overflow-x-auto">
        <div className="relative inline-block p-4 pt-7">
        <table className="border-collapse font-mono text-[11px]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-teal-100 z-10 min-w-[46px]" rowSpan={2} />
              {Array.from({ length: N_COLGROUPS }).map((_, cg) => (
                <th
                  key={cg}
                  colSpan={3}
                  className={`bg-teal-100 text-teal-900 font-disp font-bold text-[10px] py-1 ${cg > 0 ? 'border-l-2 border-lineStrong' : ''}`}
                >
                  COL {cg + 1}
                </th>
              ))}
            </tr>
            <tr>
              {Array.from({ length: N_COLGROUPS }).flatMap((_, cg) =>
                ['G1', 'H', 'G2'].map((lab, i) => (
                  <th
                    key={`${cg}-${lab}`}
                    className={`bg-teal-100 text-teal-900 font-semibold text-[10px] py-1 ${i === 0 ? 'border-l-2 border-lineStrong' : ''}`}
                  >
                    {lab}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }).map((_, r) => {
              const rm = r % 3;
              return (
                <tr key={r} className={rm === 0 ? 'border-t-2 border-lineStrong' : ''}>
                  <td className="sticky left-0 bg-teal-100 text-teal-700 font-semibold text-center border border-line">
                    {rm === 0 ? 'T1' : rm === 1 ? 'H' : 'T2'}
                  </td>
                  {Array.from({ length: COLS }).map((_, c) => {
                    const cm = c % 3;
                    const strongL = cm === 0 && rm === 0;
                    if (!isActive(r, c)) {
                      return (
                        <td
                          key={c}
                          className={`grid-cell-inactive border border-line ${strongL ? 'border-l-2 border-lineStrong' : ''}`}
                        >
                          {rm === 0 && cm === 0 ? String(pointNumber(r, c)) : ''}
                        </td>
                      );
                    }
                    const role = cellRole(r, c);
                    const value = grid[r][c];
                    const placeholder = '';
                    return (
                      <td
                        key={c}
                        className={`grid-cell-active border border-line ${strongL ? 'border-l-2 border-lineStrong' : ''} ${role === 'H' && rm === 1 ? 'grid-cell-filled' : ''} ${value !== null && value !== undefined && value === results.planes[role]?.maxima ? 'grid-cell-max' : ''} ${value !== null && value !== undefined && value === results.planes[role]?.minima ? 'grid-cell-min' : ''}`}
                      >
                        <input
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          className={role === 'H' && rm === 1 && value !== null && value !== undefined && value !== '' ? 'font-bold' : ''}
                          placeholder={placeholder}
                          value={value === null || value === undefined ? '' : value}
                          onChange={(e) => handleInput(r, c, e.target.value)}
                          onPaste={(e) => handlePaste(e, r, c)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <input maxLength={2} value={torres?.tl || ''} onChange={(e) => onTorresChange?.('tl', e.target.value.toUpperCase())} className="absolute top-1 -left-3.5 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        <input maxLength={2} value={torres?.tm || ''} onChange={(e) => onTorresChange?.('tm', e.target.value.toUpperCase())} className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        <input maxLength={2} value={torres?.tr || ''} onChange={(e) => onTorresChange?.('tr', e.target.value.toUpperCase())} className="absolute top-1 -right-3.5 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        <input maxLength={2} value={torres?.bl || ''} onChange={(e) => onTorresChange?.('bl', e.target.value.toUpperCase())} className="absolute -bottom-3.5 -left-3.5 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        <input maxLength={2} value={torres?.bm || ''} onChange={(e) => onTorresChange?.('bm', e.target.value.toUpperCase())} className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        <input maxLength={2} value={torres?.br || ''} onChange={(e) => onTorresChange?.('br', e.target.value.toUpperCase())} className="absolute -bottom-3.5 -right-3.5 w-7 h-7 rounded-full border border-lineStrong bg-white text-center text-[10px] font-semibold" />
        </div>
      </div>
    </div>
  );
}