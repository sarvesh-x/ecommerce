const mongoose = require('mongoose');
const db = require('../../config/db');

// Define Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentCaptured: Boolean,
  cancelledAt: Date,
  productId: String,
  productName: String,
  quantity: { type: Number, default: 1 },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store orders.');
  }
  return true;
}

exports.createOrder = async (order) => {
  await ensureMongoConnection();

  const newOrder = new Order({
    orderId: order.orderId,
    userId: order.userId,
    customerName: order.customerName,
    shippingAddress: order.shippingAddress,
    total: order.total,
    status: order.status || 'pending',
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    razorpaySignature: order.razorpaySignature,
    paymentCaptured: order.paymentCaptured,
    cancelledAt: order.cancelledAt,
    productId: order.productId,
    productName: order.productName,
    quantity: order.quantity,
    items: order.items,
    createdAt: order.createdAt || new Date(),
    updatedAt: order.updatedAt || new Date(),
  });

  await newOrder.save();
  return order;
};

exports.getOrdersByUser = async (userId) => {
  await ensureMongoConnection();

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return orders.map((o) => ({
    userId: o.userId,
    orderId: o.orderId,
    customerName: o.customerName,
    shippingAddress: o.shippingAddress,
    total: o.total,
    status: o.status,
    razorpayOrderId: o.razorpayOrderId,
    cancelledAt: o.cancelledAt,
    createdAt: o.createdAt,
    productId: o.productId,
    productName: o.productName,
    quantity: o.quantity,
    items: o.items,
  }));
};

exports.updateOrder = async (userId, orderId, updates) => {
  await ensureMongoConnection();

  const query = userId ? { orderId, userId } : { orderId };
  const order = await Order.findOneAndUpdate(
    query,
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (!order) return null;

  return {
    userId: order.userId,
    orderId: order.orderId,
    customerName: order.customerName,
    shippingAddress: order.shippingAddress,
    total: order.total,
    status: order.status,
    razorpayOrderId: order.razorpayOrderId,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    productId: order.productId,
    productName: order.productName,
    quantity: order.quantity,
    items: order.items,
  };
};

exports.getOrderById = async (orderId) => {
  await ensureMongoConnection();

  const order = await Order.findOne({ orderId });
  if (!order) return null;

  return {
    userId: order.userId,
    orderId: order.orderId,
    customerName: order.customerName,
    shippingAddress: order.shippingAddress,
    total: order.total,
    status: order.status,
    razorpayOrderId: order.razorpayOrderId,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    productId: order.productId,
    productName: order.productName,
    quantity: order.quantity,
    items: order.items,
  };
};
