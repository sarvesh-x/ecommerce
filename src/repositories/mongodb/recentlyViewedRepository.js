const mongoose = require('mongoose');
const db = require('../../config/db');

// 1. Mongoose RecentlyViewed Schema
const RecentlyViewedSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  productIds: [String],
  updatedAt: { type: Date, default: Date.now },
});

let RecentlyViewedModel = null;
try {
  RecentlyViewedModel = mongoose.model('RecentlyViewed', RecentlyViewedSchema);
} catch (e) {
  RecentlyViewedModel = mongoose.models.RecentlyViewed;
}

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store recently viewed products.');
  }
  return true;
}

exports.getRecentlyViewed = async (userId) => {
  await ensureMongoConnection();
  const record = await RecentlyViewedModel.findOne({ userId }).lean();
  return record ? record.productIds : [];
};

exports.addToRecentlyViewed = async (userId, productId) => {
  await ensureMongoConnection();
  let record = await RecentlyViewedModel.findOne({ userId });
  if (!record) {
    record = new RecentlyViewedModel({ userId, productIds: [] });
  }
  
  // Remove if exists
  record.productIds = record.productIds.filter(id => id !== productId);
  // Add to front
  record.productIds.unshift(productId);
  // Limit to 10
  if (record.productIds.length > 10) {
    record.productIds = record.productIds.slice(0, 10);
  }
  
  record.updatedAt = new Date();
  await record.save();
  return record.productIds;
};
