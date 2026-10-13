import mongoose from 'mongoose';
import { ENV } from './env.js';

let isConnected = false;
let connectionPromise: Promise<typeof mongoose | null> | null = null;

export const connectDB = async (customUri?: string): Promise<typeof mongoose | null> => {
  const uri = customUri || ENV.MONGODB_URI;

  if (!uri) {
    console.warn('[Database] No MONGODB_URI provided.');
    return null;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (connectionPromise && !customUri) {
    return connectionPromise;
  }

  const connectTask = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      });
      isConnected = true;
      console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn('[Database] MongoDB connection error:', (error as Error).message);
      connectionPromise = null;
      return null;
    }
  })();

  if (!customUri) {
    connectionPromise = connectTask;
  }

  return connectTask;
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  connectionPromise = null;
  console.log('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error event:', err.message);
});
