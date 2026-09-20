import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI .env.local में define नहीं है');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('✅ MongoDB already connected');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔌 Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`📊 Database: ${mongooseInstance.connection.name}`);
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;