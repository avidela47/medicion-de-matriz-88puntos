import { PLANES, fmt, fmtRatio } from '../lib/gridLogic';

export default function ResultsPanel({ results }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {PLANES.map((p) => {
        const d = results.planes[p.key];
        const u1cls = d.u1 !== null ? (d.u1 >= 0.5 ? 'text-good' : 'text-bad') : '';
        return (
          <div key={p.key} className="border border-line rounded-lg overflow-hidden bg-white">
            <div className="bg-teal-700 text-white px-3 py-2 flex justify-between items-center font-disp font-semibold text-[12px]">
              <span>{p.label}</span>
              <span className="font-mono font-normal text-[10.5px] opacity-85">
                {d.count}/{d.expected} pts
              </span>
            </div>
            <dl className="px-3 py-2">
              <Row k="Media (lux)" v={fmt(d.media)} />
              <Row k="Máxima (lux)" v={fmt(d.maxima)} />
              <Row k="Mínima (lux)" v={fmt(d.minima)} />
              <Row k="U1 (mín/máx)" v={fmtRatio(d.u1)} vClass={u1cls} />
              <Row k="U2 (mín/media)" v={fmtRatio(d.u2)} last />
            </dl>
          </div>
        );
      })}
    </div>
  );
}

function Row({ k, v, vClass = '', last = false }) {
  return (
    <div className={`flex justify-between items-baseline py-1 ${last ? '' : 'border-b border-dashed border-line'}`}>
      <span className="text-[11px] text-muted font-medium">{k}</span>
      <span className={`font-mono text-[13.5px] font-semibold text-ink ${vClass}`}>{v}</span>
    </div>
  );
}