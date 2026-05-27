const mongoose = require('mongoose');
const db = require('../../config/db');

// 1. Mongoose Wishlist Schema
const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  productIds: [String],
  updatedAt: { type: Date, default: Date.now },
});

let WishlistModel = null;
try {
  WishlistModel = mongoose.model('Wishlist', WishlistSchema);
} catch (e) {
  WishlistModel = mongoose.models.Wishlist;
}

// In-memory fallback wishlist database
const memoryWishlists = {};

exports.getWishlist = async (userId) => {
  if (db.isMongoActive()) {
    const list = await WishlistModel.findOne({ userId }).lean();
    return list ? list.productIds : [];
  } else {
    return memoryWishlists[userId] || [];
  }
};

exports.addToWishlist = async (userId, productId) => {
  if (db.isMongoActive()) {
    const list = await WishlistModel.findOneAndUpdate(
      { userId },
      { $addToSet: { productIds: productId }, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
    return list.productIds;
  } else {
    if (!memoryWishlists[userId]) memoryWishlists[userId] = [];
    if (!memoryWishlists[userId].includes(productId)) {
      memoryWishlists[userId].push(productId);
    }
    return memoryWishlists[userId];
  }
};

exports.removeFromWishlist = async (userId, productId) => {
  if (db.isMongoActive()) {
    const list = await WishlistModel.findOneAndUpdate(
      { userId },
      { $pull: { productIds: productId }, $set: { updatedAt: new Date() } },
      { new: true }
    ).lean();
    return list ? list.productIds : [];
  } else {
    if (!memoryWishlists[userId]) memoryWishlists[userId] = [];
    const index = memoryWishlists[userId].indexOf(productId);
    if (index !== -1) {
      memoryWishlists[userId].splice(index, 1);
    }
    return memoryWishlists[userId];
  }
};
