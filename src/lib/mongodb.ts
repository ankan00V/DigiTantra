import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME ?? "digitantra";

declare global {
  // eslint-disable-next-line no-var
  var __digitantraMongoClientPromise__: Promise<MongoClient> | undefined;
}

function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!global.__digitantraMongoClientPromise__) {
    global.__digitantraMongoClientPromise__ = new MongoClient(uri, {
      appName: "DigiTantra",
    }).connect();
  }

  return global.__digitantraMongoClientPromise__;
}

export async function getMongoDb() {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}
