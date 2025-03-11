import dotenv from 'dotenv';
dotenv.config();

import { MongoClient, Db } from 'mongodb';
import { logWithLocation } from '../helpers/betterConsoleLog';

const connectionString = process.env['CONNECTION_STRING'];
const dbName = process.env['MONGODB_DB_NAME'];

if (!connectionString) {
  console.error('CONNECTION_STRING is not defined in environment variables');
  process.exit(1);
}

if (!dbName) {
  throw new Error('MONGODB_DB_NAME is not defined in environment variables');
}

let client: MongoClient | null = null;
let db: Db | null = null;

const connect = async (): Promise<void> => {
  if (!client) {
    client = await MongoClient.connect(connectionString).catch((err) => {
      logWithLocation(`Failed to connect to MongoDB: ${err}`, 'error');
      throw err;
    });
    db = client.db(dbName);
    logWithLocation(`Connected to ${dbName} successfully.`, 'success');
  }
};

const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logWithLocation('Database connection closed.', 'info');
  }
};

const getDb = (): Db => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export { connect, closeConnection, getDb };
