import { MongoClientOptions } from 'mongodb';

export const mongoConfig: MongoClientOptions = {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  ssl: true,
  monitorCommands: true,
  family: 4,
};
