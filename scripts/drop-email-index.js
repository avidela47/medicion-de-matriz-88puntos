// Uso: npm run drop-email-index
// Elimina el índice único sobre "email" que quedó de otro proyecto/plantilla
// y que bloquea la creación de más de un usuario sin email.

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'itelsa';
  if (!uri) {
    console.error('Falta MONGODB_URI en .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('users');

  const indexes = await col.indexes();
  console.log('Índices actuales:', indexes.map((i) => i.name));

  const target = indexes.find((i) => i.key && i.key.email === 1);
  if (!target) {
    console.log('No se encontró un índice sobre "email". No hay nada que borrar.');
  } else {
    await col.dropIndex(target.name);
    console.log(`Índice "${target.name}" eliminado.`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});