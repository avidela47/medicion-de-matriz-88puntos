import * as XLSX from 'xlsx';
import { PLANES, ROWS, COLS, isActive } from './gridLogic';

export function buildWorkbook(meta, results, grid) {
  const wb = XLSX.utils.book_new();

  const resumenRows = [
    ['ITELSA — Relevamiento Lumínico'],
    ['Cancha / predio', meta.cancha || ''],
    ['Fecha', meta.fecha || ''],
    ['Responsable', meta.createdBy || meta.updatedBy || ''],
    ['Equipo', meta.equipo || ''],
    ['Observaciones', meta.observaciones || ''],
    [],
    ['', ...PLANES.map((p) => p.label)],
  ];
  const rowsSpec = [
    ['Puntos cargados', (p) => `${results.planes[p.key].count}/${results.planes[p.key].expected}`],
    ['Media (lux)', (p) => results.planes[p.key].media],
    ['Máxima (lux)', (p) => results.planes[p.key].maxima],
    ['Mínima (lux)', (p) => results.planes[p.key].minima],
    ['U1 (mín/máx)', (p) => results.planes[p.key].u1],
    ['U2 (mín/media)', (p) => results.planes[p.key].u2],
  ];
  rowsSpec.forEach(([label, fn]) => {
    resumenRows.push([label, ...PLANES.map((p) => fn(p) ?? '')]);
  });
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  wsResumen['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  const datosRows = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(isActive(r, c) ? grid?.[r]?.[c] ?? '' : '');
    }
    datosRows.push(row);
  }
  const wsDatos = XLSX.utils.aoa_to_sheet(datosRows);
  XLSX.utils.book_append_sheet(wb, wsDatos, 'Datos');

  return wb;
}

export function downloadWorkbook(wb, canchaName) {
  const fname = `Relevamiento_${(canchaName || 'sin_nombre').replace(/[^\w-]+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fname);
}