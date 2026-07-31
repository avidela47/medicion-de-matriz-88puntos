import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { computeResults } from '../../../lib/gridLogic';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'No autenticado' });

  const db = await getDb();
  const col = db.collection('relevamientos');

  if (req.method === 'GET') {
    const list = await col
      .find({}, { projection: { grid: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();
    return res.status(200).json(list);
  }

  if (req.method === 'POST') {
    const { cancha, fecha, equipo, observaciones, grid, torres } = req.body || {};
    if (!cancha || !grid) {
      return res.status(400).json({ error: 'Falta cancha o grilla de datos' });
    }
    const now = new Date();
    const doc = {
      cancha,
      fecha: fecha || null,
      equipo: equipo || '',
      observaciones: observaciones || '',
      grid,
      torres: torres || {},
      results: computeResults(grid),
      historial: [{ ts: now, accion: 'Creado', usuario: session.user.username }],
      createdBy: session.user.username,
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc);
    return res.status(201).json({ id: result.insertedId.toString() });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}