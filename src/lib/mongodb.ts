import { Db, MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME ?? "digitantra";

type GlobalMongoState = typeof globalThis & {
  __digitantraMongoClientPromise__?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalMongoState;

function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!globalForMongo.__digitantraMongoClientPromise__) {
    globalForMongo.__digitantraMongoClientPromise__ = new MongoClient(uri, {
      appName: "DigiTantra",
    }).connect();
  }

  return globalForMongo.__digitantraMongoClientPromise__;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}
