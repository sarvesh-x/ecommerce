const mongoose = require('mongoose');
const db = require('../../config/db');

// 1. Mongoose Review Schema
const ReviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

let ReviewModel = null;
try {
  ReviewModel = mongoose.model('Review', ReviewSchema);
} catch (e) {
  ReviewModel = mongoose.models.Review;
}

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store product reviews.');
  }
  return true;
}

exports.getReviews = async (productId) => {
  await ensureMongoConnection();
  return await ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();
};

exports.createReview = async (review) => {
  await ensureMongoConnection();
  const r = new ReviewModel(review);
  await r.save();
  return r.toObject();
};
