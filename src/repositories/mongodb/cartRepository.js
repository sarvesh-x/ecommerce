const mongoose = require('mongoose');
const db = require('../../config/db');

// 1. Mongoose Cart Schema
const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      size: { type: String },
      color: { type: String },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

let CartModel = null;
try {
  CartModel = mongoose.model('Cart', CartSchema);
} catch (e) {
  CartModel = mongoose.models.Cart;
}

// In-memory fallback cart database
const memoryCarts = {};

exports.getCart = async (userId) => {
  if (db.isMongoActive()) {
    const cart = await CartModel.findOne({ userId }).lean();
    return cart ? cart.items : [];
  } else {
    return memoryCarts[userId] || [];
  }
};

exports.saveCart = async (userId, items) => {
  if (db.isMongoActive()) {
    await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return items;
  } else {
    memoryCarts[userId] = items;
    return items;
  }
};

exports.clearCart = async (userId) => {
  if (db.isMongoActive()) {
    await CartModel.deleteOne({ userId });
    return true;
  } else {
    memoryCarts[userId] = [];
    return true;
  }
};
