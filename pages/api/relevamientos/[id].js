import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { getDb } from '../../../lib/mongodb';
import { computeResults } from '../../../lib/gridLogic';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'No autenticado' });

  const { id } = req.query;
  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Id inválido' });
  }

  const db = await getDb();
  const col = db.collection('relevamientos');

  if (req.method === 'GET') {
    const doc = await col.findOne({ _id });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    return res.status(200).json(doc);
  }

  if (req.method === 'PUT') {
    const { cancha, fecha, equipo, observaciones, grid, torres } = req.body || {};
    if (!cancha || !grid) {
      return res.status(400).json({ error: 'Falta cancha o grilla de datos' });
    }
    const existing = await col.findOne({ _id });
    if (!existing) return res.status(404).json({ error: 'No encontrado' });

    const now = new Date();
    const historial = [...(existing.historial || []), { ts: now, accion: 'Editado', usuario: session.user.username }];

    await col.updateOne(
      { _id },
      {
        $set: {
          cancha,
          fecha: fecha || null,
          equipo: equipo || '',
          observaciones: observaciones || '',
          grid,
          torres: torres || {},
          results: computeResults(grid),
          historial,
          updatedAt: now,
          updatedBy: session.user.username,
        },
      }
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const existing = await col.findOne({ _id });
    if (!existing) return res.status(404).json({ error: 'No encontrado' });
    await col.deleteOne({ _id });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end();
}