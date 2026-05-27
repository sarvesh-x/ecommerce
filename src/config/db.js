const { Pool } = require('pg');
const mongoose = require('mongoose');

// PostgreSQL Connection Pool
let pgPool = null;

if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Global flag to track connection states
let isPostgresConnected = false;
let isMongoConnected = false;

async function connectPostgres() {
  if (!pgPool) {
    console.warn('PostgreSQL DATABASE_URL not configured. Running in Mock Mode.');
    return null;
  }
  try {
    const client = await pgPool.connect();
    client.release();
    isPostgresConnected = true;
    console.log('PostgreSQL connected successfully.');
    return pgPool;
  } catch (error) {
    console.warn(`PostgreSQL Connection Failed: ${error.message}. Falling back to In-Memory Mock Database.`);
    isPostgresConnected = false;
    return null;
  }
}

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MongoDB MONGODB_URI not configured. Running in Mock Mode.');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log('MongoDB connected successfully.');
    return true;
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}. Falling back to In-Memory Mock Database.`);
    isMongoConnected = false;
    return false;
  }
}

module.exports = {
  connectPostgres,
  connectMongo,
  getPgPool: () => (isPostgresConnected ? pgPool : null),
  isPostgresActive: () => isPostgresConnected,
  isMongoActive: () => isMongoConnected,
};
