import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'itelsa';

if (!uri) {
  throw new Error(
    'Falta MONGODB_URI. Copiá .env.local.example a .env.local y completá tu cadena de conexión de Atlas.'
  );
}

let cachedClient = global._mongoClient;
let cachedClientPromise = global._mongoClientPromise;

if (!cachedClientPromise) {
  cachedClient = new MongoClient(uri);
  cachedClientPromise = cachedClient.connect();
  global._mongoClient = cachedClient;
  global._mongoClientPromise = cachedClientPromise;
}

export async function getDb() {
  const client = await cachedClientPromise;
  return client.db(dbName);
}