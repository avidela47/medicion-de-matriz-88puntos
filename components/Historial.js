import { useEffect, useState } from 'react';

export default function Historial({ onOpen }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLog, setOpenLog] = useState(null);
  const [logData, setLogData] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/relevamientos');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleLog(id) {
    if (openLog === id) {
      setOpenLog(null);
      return;
    }
    const res = await fetch(`/api/relevamientos/${id}`);
    const data = await res.json();
    setLogData(data.historial || []);
    setOpenLog(id);
  }

  async function remove(id, cancha) {
    if (!confirm(`Eliminar el relevamiento de "${cancha}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/relevamientos/${id}`, { method: 'DELETE' });
    load();
  }

  async function exportOne(id) {
    const res = await fetch(`/api/relevamientos/${id}`);
    const data = await res.json();
    const { buildWorkbook, downloadWorkbook } = await import('../lib/exportExcel');
    const wb = buildWorkbook(data, data.results, data.grid);
    downloadWorkbook(wb, data.cancha);
  }

  if (loading) return <p className="text-sm text-muted">Cargando…</p>;

  if (!items.length) {
    return (
      <div className="text-center py-10 text-muted text-sm">
        <p className="font-disp text-base text-ink mb-1">Todavía no hay relevamientos guardados</p>
        <p>Los que guardes desde &quot;Nuevo relevamiento&quot; van a aparecer acá, con su historial de versiones.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item._id} className="bg-white border border-line rounded-lg px-4 py-3.5 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <div className="font-disp font-semibold text-sm text-ink">{item.cancha}</div>
            <div className="text-[11.5px] text-muted font-mono mt-0.5">
              Relevado: {item.fecha ? new Date(item.fecha).toLocaleDateString('es-AR') : '—'} · Última
              modificación: {new Date(item.updatedAt).toLocaleString('es-AR')}
              {item.updatedBy ? ` · por ${item.updatedBy}` : item.createdBy ? ` · por ${item.createdBy}` : ''}
            </div>
            {openLog === item._id && (
              <div className="mt-2 pt-2 border-t border-dashed border-line text-[11.5px] text-muted">
                <strong>Historial de cambios</strong>
                <ul className="mt-1 pl-4 list-disc">
                  {(logData || []).slice().reverse().map((h, i) => (
                    <li key={i} className="font-mono text-[11px]">
                      {new Date(h.ts).toLocaleString('es-AR')} — {h.accion} — {h.usuario}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-sm btn-outline" onClick={() => onOpen(item._id)}>
              Abrir
            </button>
            <button className="btn-sm btn-ghost" onClick={() => toggleLog(item._id)}>
              Ver cambios
            </button>
            <button className="btn-sm btn-outline" onClick={() => exportOne(item._id)}>
              Excel
            </button>
            <button className="btn-sm btn-danger" onClick={() => remove(item._id, item.cancha)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
      <style jsx>{`
        .btn-sm {
          padding: 6px 11px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-outline {
          background: #fff;
          color: #1b5e5a;
          border: 1px solid #2f8f8a;
        }
        .btn-outline:hover {
          background: #e4f2f0;
        }
        .btn-ghost {
          background: transparent;
          color: #5c7175;
          border: 1px solid #b9cbc8;
        }
        .btn-danger {
          background: #fff;
          color: #b5473b;
          border: 1px solid #b5473b;
        }
        .btn-danger:hover {
          background: #fbeded;
        }
      `}</style>
    </div>
  );
}