import { useState, useMemo } from 'react';
import { getServerSession } from 'next-auth/next';
import { signOut } from 'next-auth/react';
import { authOptions } from './api/auth/[...nextauth]';
import GridInput from '../components/GridInput';
import ResultsPanel from '../components/ResultsPanel';
import Historial from '../components/Historial';
import { makeEmptyGrid, computeResults } from '../lib/gridLogic';
import { buildWorkbook, downloadWorkbook } from '../lib/exportExcel';

export default function Home({ user }) {
  const [tab, setTab] = useState('nuevo');
  const [currentId, setCurrentId] = useState(null);
  const [meta, setMeta] = useState({ cancha: '', fecha: '', equipo: '', observaciones: '' });
  const [grid, setGrid] = useState(makeEmptyGrid());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [editingBanner, setEditingBanner] = useState(false);

  const results = useMemo(() => computeResults(grid), [grid]);

  function updateCell(r, c, value) {
    setGrid((prev) => {
      const next = prev.map((row) => row.slice());
      next[r][c] = value;
      return next;
    });
  }

  function startNew() {
    setCurrentId(null);
    setMeta({ cancha: '', fecha: '', equipo: '', observaciones: '' });
    setGrid(makeEmptyGrid());
    setEditingBanner(false);
    setSaveMsg('');
  }

  async function openRelevamiento(id) {
    const res = await fetch(`/api/relevamientos/${id}`);
    if (!res.ok) return alert('No se pudo abrir el relevamiento.');
    const data = await res.json();
    setCurrentId(data._id);
    setMeta({
      cancha: data.cancha || '',
      fecha: data.fecha ? data.fecha.substring(0, 10) : '',
      equipo: data.equipo || '',
      observaciones: data.observaciones || '',
    });
    setGrid(data.grid);
    setEditingBanner(true);
    setTab('nuevo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function save() {
    if (!meta.cancha.trim()) {
      alert('Ingresá el nombre de la cancha/predio antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      const body = { ...meta, grid };
      const res = currentId
        ? await fetch(`/api/relevamientos/${currentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/relevamientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
      if (!res.ok) throw new Error('save failed');
      const data = await res.json();
      if (!currentId) setCurrentId(data.id);
      setEditingBanner(true);
      setSaveMsg('Guardado ✓');
      setTimeout(() => setSaveMsg(''), 1800);
    } catch (err) {
      alert('No se pudo guardar. Reintentá en unos segundos.');
    } finally {
      setSaving(false);
    }
  }

  function exportExcel() {
    const wb = buildWorkbook({ ...meta, createdBy: user.username }, results, grid);
    downloadWorkbook(wb, meta.cancha);
  }

  function doPrint() {
    window.print();
  }

  return (
    <div>
      <header className="no-print bg-gradient-to-br from-navy-950 to-teal-900 text-white px-7 py-4 flex items-center justify-between gap-4 border-b-[3px] border-teal-500 flex-wrap">
        <div className="flex items-center gap-3.5">
          <img src="/logo.png" alt="ITELSA" className="h-8" />
          <div>
            <div className="font-disp font-bold text-[15px] uppercase tracking-wide">Relevamiento Lumínico</div>
            <div className="text-[11.5px] text-teal-300">Iluminancias horizontal y vertical · Uniformidad</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              className={`text-[12.5px] font-semibold px-4 py-2 rounded-md ${tab === 'nuevo' ? 'bg-teal-500 text-white' : 'text-white/70 hover:text-white'}`}
              onClick={() => setTab('nuevo')}
            >
              Nuevo relevamiento
            </button>
            <button
              className={`text-[12.5px] font-semibold px-4 py-2 rounded-md ${tab === 'historial' ? 'bg-teal-500 text-white' : 'text-white/70 hover:text-white'}`}
              onClick={() => setTab('historial')}
            >
              Historial
            </button>
          </nav>
          <div className="text-right text-[11.5px] text-teal-300 leading-tight">
            <div>{user.name}</div>
            <button className="underline hover:text-white" onClick={() => signOut({ callbackUrl: '/login' })}>
              cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-7 py-6 pb-16">
        {tab === 'nuevo' && (
          <section>
            {editingBanner && (
              <div className="no-print flex items-center justify-between gap-3 bg-amber text-white px-4 py-2.5 rounded-lg mb-4 text-[13px]">
                <span>
                  {saveMsg || `Editando "${meta.cancha}". Al guardar se registra una nueva versión en el historial de cambios.`}
                </span>
                <button
                  className="bg-white/20 border border-white/50 text-white px-3 py-1.5 rounded-md text-xs"
                  onClick={startNew}
                >
                  Empezar uno nuevo
                </button>
              </div>
            )}

            <div className="no-print bg-white border border-line rounded-lg px-5 py-4.5 mb-4.5">
              <h2 className="font-disp text-[13px] uppercase tracking-wide text-teal-700 mb-3.5 flex items-center gap-2">
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-[11px] font-mono">1</span>
                Datos del relevamiento
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <Field label="Cancha / predio" value={meta.cancha} onChange={(v) => setMeta((m) => ({ ...m, cancha: v }))} placeholder="Ej: Estadio Malvinas Argentinas" />
                <Field label="Fecha" type="date" value={meta.fecha} onChange={(v) => setMeta((m) => ({ ...m, fecha: v }))} />
                <Field label="Equipo / luxómetro" value={meta.equipo} onChange={(v) => setMeta((m) => ({ ...m, equipo: v }))} placeholder="Modelo y N° de serie" />
                <Field label="Responsable" value={user.name} disabled />
                <div className="col-span-2 md:col-span-4">
                  <FieldLabel>Observaciones</FieldLabel>
                  <textarea
                    className="w-full border border-lineStrong rounded-md px-2.5 py-2 text-[13.5px] min-h-[44px]"
                    value={meta.observaciones}
                    onChange={(e) => setMeta((m) => ({ ...m, observaciones: e.target.value }))}
                    placeholder="Condiciones climáticas, altura de medición, notas..."
                  />
                </div>
              </div>
            </div>

            <div className="no-print bg-white border border-line rounded-lg px-5 py-4.5 mb-4.5">
              <h2 className="font-disp text-[13px] uppercase tracking-wide text-teal-700 mb-3.5 flex items-center gap-2">
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-[11px] font-mono">2</span>
                Grilla de medición (88 puntos)
              </h2>
              <GridInput grid={grid} onChange={updateCell} filled={results.filled} />
            </div>

            <div className="bg-white border border-line rounded-lg px-5 py-4.5">
              <h2 className="font-disp text-[13px] uppercase tracking-wide text-teal-700 mb-3.5 flex items-center gap-2 no-print">
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full bg-teal-700 text-white text-[11px] font-mono">3</span>
                Resultados
              </h2>
              <ResultsPanel results={results} />

              <div className="no-print flex gap-2.5 mt-4.5 flex-wrap">
                <button onClick={save} disabled={saving} className="btn btn-primary">
                  💾 {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button onClick={exportExcel} className="btn btn-outline">
                  ⭳ Exportar a Excel
                </button>
                <button onClick={doPrint} className="btn btn-outline">
                  🖶 Imprimir / PDF
                </button>
                <button onClick={startNew} className="btn btn-ghost">
                  Limpiar grilla
                </button>
              </div>
            </div>
          </section>
        )}

        {tab === 'historial' && (
          <section className="no-print bg-white border border-line rounded-lg px-5 py-4.5">
            <h2 className="font-disp text-[13px] uppercase tracking-wide text-teal-700 mb-3.5">Historial de relevamientos</h2>
            <Historial onOpen={openRelevamiento} />
          </section>
        )}
      </main>

      <style jsx global>{`
        .btn {
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 7px;
          cursor: pointer;
        }
        .btn-primary {
          background: #1b5e5a;
          color: #fff;
        }
        .btn-primary:hover {
          background: #226e68;
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
      `}</style>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="block text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">{children}</label>;
}

function Field({ label, value, onChange, type = 'text', placeholder, disabled = false }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-lineStrong rounded-md px-2.5 py-2 text-[13.5px] ${disabled ? 'bg-paper text-muted' : ''}`}
      />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user } };
}