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

// In-memory fallback review database
const memoryReviews = {};

exports.getReviews = async (productId) => {
  if (db.isMongoActive()) {
    return await ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();
  } else {
    return memoryReviews[productId] || [];
  }
};

exports.createReview = async (review) => {
  if (db.isMongoActive()) {
    const r = new ReviewModel(review);
    await r.save();
    return r.toObject();
  } else {
    const pid = review.productId;
    if (!memoryReviews[pid]) memoryReviews[pid] = [];
    memoryReviews[pid].unshift(review);
    return review;
  }
};
