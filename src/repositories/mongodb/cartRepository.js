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

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store cart items.');
  }
  return true;
}

exports.getCart = async (userId) => {
  await ensureMongoConnection();
  const cart = await CartModel.findOne({ userId }).lean();
  return cart ? cart.items : [];
};

exports.saveCart = async (userId, items) => {
  await ensureMongoConnection();
  await CartModel.findOneAndUpdate(
    { userId },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true, new: true }
  );
  return items;
};

exports.clearCart = async (userId) => {
  await ensureMongoConnection();
  await CartModel.deleteOne({ userId });
  return true;
};
