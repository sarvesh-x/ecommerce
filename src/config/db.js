const { Pool } = require('pg');
const mongoose = require('mongoose');

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

// PostgreSQL Connection Pool
let pgPool = null;

const postgresUrl = process.env.DATABASE_URL || process.env.NEON_DB_URI;

if (postgresUrl) {
  pgPool = new Pool({
    connectionString: postgresUrl,
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
  const uri = getMongoUri();

  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      console.log('MongoDB already connected.');
      return true;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'ecommerce',
    });
    isMongoConnected = true;
    console.log('MongoDB connected successfully.');
    return true;
  } catch (error) {
    if (isMongoConfigured()) {
      console.warn(`MongoDB Connection Failed: ${error.message}. MongoDB-backed features will be unavailable until the connection succeeds.`);
    } else {
      console.warn(`MongoDB Connection Failed: ${error.message}. Set MONGODB_URI or start local MongoDB to use MongoDB-backed features.`);
    }
    isMongoConnected = false;
    return false;
  }
}

function getMongoUri() {
  const configuredUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  return configuredUri || DEFAULT_MONGODB_URI;
}

function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
}

module.exports = {
  connectPostgres,
  connectMongo,
  getPgPool: () => (isPostgresConnected ? pgPool : null),
  getMongoUri,
  isPostgresActive: () => isPostgresConnected,
  isMongoActive: () => isMongoConnected,
  isMongoConfigured,
};
