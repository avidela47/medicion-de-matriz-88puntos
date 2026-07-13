require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

async function main() {
  const [, , username, password, ...nombreParts] = process.argv;
  if (!username || !password) {
    console.error('Uso: npm run create-user -- usuario "contraseña" "Nombre Apellido"');
    process.exit(1);
  }
  const nombre = nombreParts.join(' ') || username;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'itelsa';
  if (!uri) {
    console.error('Falta MONGODB_URI en .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const passwordHash = await bcrypt.hash(password, 10);
  const usernameNorm = username.trim().toLowerCase();

  await db.collection('users').updateOne(
    { username: usernameNorm },
    { $set: { username: usernameNorm, nombre, passwordHash, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  console.log(`Listo. Usuario "${usernameNorm}" (${nombre}) puede iniciar sesión.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});