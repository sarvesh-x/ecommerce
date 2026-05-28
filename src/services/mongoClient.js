const mongoose = require('mongoose');

/**
 * MongoDB Client
 * Provides connection to MongoDB using Mongoose
 * Returns the mongoose instance for use in services
 */

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function connectMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected.');
      return mongoose;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully.');
    return mongoose;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn('Running in memory fallback mode.');
    return null;
  }
}

// Auto-connect on module load
connectMongo().catch((err) => {
  console.error('Failed to initialize MongoDB connection:', err.message);
});

module.exports = mongoose;
