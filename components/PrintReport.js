import { PLANES, N_COLGROUPS, ROWS, COLS, isActive, pointNumber, fmt, fmtRatio } from '../lib/gridLogic';

export default function PrintReport({ meta, grid, results, responsable }) {
  return (
    <div className="hidden print:block">
      <div className="p-3 break-after-page">
        <PrintHeader meta={meta} responsable={responsable} tight />
        <h3 className="font-disp font-semibold text-[11px] uppercase tracking-wide text-teal-700 mt-1 mb-0.5">
          Grilla de medición (88 puntos)
        </h3>
        <PrintLegend filled={results.filled} />
        <PrintGrid grid={grid} />
      </div>
      <div className="p-6">
        <PrintHeader meta={meta} responsable={responsable} />
        <h3 className="font-disp font-semibold text-[13px] uppercase tracking-wide text-teal-700 mt-4 mb-2">
          Resultados
        </h3>
        <PrintResultsTable results={results} />
      </div>
    </div>
  );
}

function PrintHeader({ meta, responsable, compact = false, tight = false }) {
  return (
    <div className={`border-b-[3px] border-teal-700 ${compact || tight ? 'pb-1 mb-1' : 'pb-3 mb-3'}`}>
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="ITELSA" className={compact ? 'h-6' : 'h-10'} />
        <div>
          <div className="text-[8px] text-muted uppercase tracking-[0.15em]">ITELSA SAS</div>
          <div className={`font-disp font-bold ${compact ? 'text-[12px]' : 'text-[16px]'}`}>Relevamiento Lumínico</div>
        </div>
      </div>
      <div className={`grid grid-cols-4 gap-x-6 gap-y-0.5 text-[9.5px] ${compact ? 'mt-1' : tight ? 'mt-1 grid-cols-2' : 'mt-3 grid-cols-2'}`}>
        <div><span className="text-muted font-semibold">Cliente:</span> {meta.cancha || '—'}</div>
        <div><span className="text-muted font-semibold">Fecha:</span> {meta.fecha || '—'}</div>
        <div><span className="text-muted font-semibold">Responsable:</span> {responsable || '—'}</div>
        <div><span className="text-muted font-semibold">Equipo:</span> {meta.equipo || '—'}</div>
        {!compact && (
          <div className="col-span-2"><span className="text-muted font-semibold">Observaciones:</span> {meta.observaciones || '—'}</div>
        )}
      </div>
    </div>
  );
}

function PrintLegend({ filled }) {
  return (
    <div className="flex items-center gap-4 text-[8px] text-muted mb-1 flex-wrap">
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 border border-gray-400 bg-white" /> Horizontal (H)
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 border border-gray-400 bg-[#FBFDFC]" /> Vertical Tribunas (T1/T2)
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 border border-gray-400 bg-[#F6FBFA]" /> Vertical Goles (G1/G2)
      </span>
      <span className="ml-auto font-mono font-semibold text-teal-700">{filled} / 440 valores cargados</span>
    </div>
  );
}

function PrintGrid({ grid }) {
  return (
    <table className="border-collapse font-mono text-[9.5px] w-full">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-teal-100 w-[24px]" rowSpan={2} />
          {Array.from({ length: N_COLGROUPS }).map((_, cg) => (
            <th
              key={cg}
              colSpan={3}
              className={`border border-gray-300 bg-teal-100 font-disp font-bold ${cg > 0 ? 'border-l-2 border-gray-500' : ''}`}
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
                className={`border border-gray-300 bg-teal-100 font-semibold ${i === 0 ? 'border-l-2 border-gray-500' : ''}`}
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
            <tr key={r} className={rm === 0 ? 'border-t-2 border-gray-500' : ''}>
              <td className="border border-gray-300 bg-teal-100 text-center font-semibold">
                {rm === 0 ? 'T1' : rm === 1 ? 'H' : 'T2'}
              </td>
              {Array.from({ length: COLS }).map((_, c) => {
                const cm = c % 3;
                const strongL = cm === 0 && rm === 0;
                if (!isActive(r, c)) {
                  return (
                    <td key={c} className={`border border-gray-400 bg-gray-400 ${strongL ? 'border-l-2 border-gray-500' : ''}`} />
                  );
                }
                const v = grid?.[r]?.[c];
                return (
                  <td key={c} className={`border border-gray-300 text-center ${strongL ? 'border-l-2 border-gray-500' : ''}`}>
                    {v === null || v === undefined ? (rm === 0 && cm === 0 ? pointNumber(r, c) : '') : v}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PrintResultsTable({ results }) {
  const rowsSpec = [
    ['Puntos', (p) => `${results.planes[p.key].count}/${results.planes[p.key].expected}`],
    ['Media (lux)', (p) => fmt(results.planes[p.key].media)],
    ['Máxima (lux)', (p) => fmt(results.planes[p.key].maxima)],
    ['Mínima (lux)', (p) => fmt(results.planes[p.key].minima)],
    ['U1 (mín/máx)', (p) => fmtRatio(results.planes[p.key].u1)],
    ['U2 (mín/media)', (p) => fmtRatio(results.planes[p.key].u2)],
  ];
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr>
          <th className="border border-gray-300 bg-teal-100 p-2 text-left" />
          {PLANES.map((p) => (
            <th key={p.key} className="border border-gray-300 bg-teal-100 p-2">
              {p.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rowsSpec.map(([label, fn]) => (
          <tr key={label}>
            <td className="border border-gray-300 p-2 font-semibold">{label}</td>
            {PLANES.map((p) => (
              <td key={p.key} className="border border-gray-300 p-2 text-center font-mono">
                {fn(p)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}