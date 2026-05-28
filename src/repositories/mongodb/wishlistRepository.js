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

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store wishlist items.');
  }
  return true;
}

exports.getWishlist = async (userId) => {
  await ensureMongoConnection();
  const list = await WishlistModel.findOne({ userId }).lean();
  return list ? list.productIds : [];
};

exports.addToWishlist = async (userId, productId) => {
  await ensureMongoConnection();
  const list = await WishlistModel.findOneAndUpdate(
    { userId },
    { $addToSet: { productIds: productId }, $set: { updatedAt: new Date() } },
    { upsert: true, new: true }
  ).lean();
  return list.productIds;
};

exports.removeFromWishlist = async (userId, productId) => {
  await ensureMongoConnection();
  const list = await WishlistModel.findOneAndUpdate(
    { userId },
    { $pull: { productIds: productId }, $set: { updatedAt: new Date() } },
    { new: true }
  ).lean();
  return list ? list.productIds : [];
};
