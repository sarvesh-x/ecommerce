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

// In-memory fallback database
const memoryRecentlyViewed = {};

exports.getRecentlyViewed = async (userId) => {
  if (db.isMongoActive()) {
    const record = await RecentlyViewedModel.findOne({ userId }).lean();
    return record ? record.productIds : [];
  } else {
    return memoryRecentlyViewed[userId] || [];
  }
};

exports.addToRecentlyViewed = async (userId, productId) => {
  if (db.isMongoActive()) {
    // We want to pull the item if it exists, and push to front of array (most recent first)
    // To do this dynamically in Mongo, we can do it in two updates, or load, edit in JS, and save.
    // Loading, modifying, and saving is clean and reliable.
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
  } else {
    if (!memoryRecentlyViewed[userId]) memoryRecentlyViewed[userId] = [];
    memoryRecentlyViewed[userId] = memoryRecentlyViewed[userId].filter(id => id !== productId);
    memoryRecentlyViewed[userId].unshift(productId);
    if (memoryRecentlyViewed[userId].length > 10) {
      memoryRecentlyViewed[userId] = memoryRecentlyViewed[userId].slice(0, 10);
    }
    return memoryRecentlyViewed[userId];
  }
};
