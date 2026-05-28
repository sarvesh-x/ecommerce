const mongoose = require('mongoose');

// Define Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  razorpayOrderId: String,
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

// In-memory fallback datasets
const memoryOrders = [];

exports.createOrder = async (order) => {
  try {
    if (!mongoose.connection.readyState) {
      // Fallback to memory if no MongoDB connection
      memoryOrders.push(order);
      return order;
    }

    const newOrder = new Order({
      orderId: order.orderId,
      userId: order.userId,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      total: order.total,
      status: order.status || 'pending',
      razorpayOrderId: order.razorpayOrderId,
      productName: order.productName,
      quantity: order.quantity,
      items: order.items,
      createdAt: order.createdAt || new Date(),
      updatedAt: order.updatedAt || new Date(),
    });

    await newOrder.save();
    return order;
  } catch (error) {
    console.warn(`MongoDB: Failed to create order, falling back to memory database. Error: ${error.message}`);
    memoryOrders.push(order);
    return order;
  }
};

exports.getOrdersByUser = async (userId) => {
  try {
    if (!mongoose.connection.readyState) {
      // Fallback to memory
      return memoryOrders
        .filter((o) => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map((o) => ({
      userId: o.userId,
      orderId: o.orderId,
      customerName: o.customerName,
      shippingAddress: o.shippingAddress,
      total: o.total,
      status: o.status,
      razorpayOrderId: o.razorpayOrderId,
      createdAt: o.createdAt,
      productName: o.productName,
      quantity: o.quantity,
      items: o.items,
    }));
  } catch (error) {
    console.warn(`MongoDB: Failed to query orders for user ${userId}, falling back to memory database. Error: ${error.message}`);
    return memoryOrders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

exports.updateOrder = async (orderId, updates) => {
  try {
    if (!mongoose.connection.readyState) {
      // Fallback to memory
      const order = memoryOrders.find((o) => o.orderId === orderId);
      if (!order) return null;
      Object.assign(order, updates, { updatedAt: new Date() });
      return order;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
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
      createdAt: order.createdAt,
      productName: order.productName,
      quantity: order.quantity,
      items: order.items,
    };
  } catch (error) {
    console.warn(`MongoDB: Failed to update order ${orderId}, falling back to memory database. Error: ${error.message}`);
    const order = memoryOrders.find((o) => o.orderId === orderId);
    if (!order) return null;
    Object.assign(order, updates, { updatedAt: new Date() });
    return order;
  }
};

exports.getOrderById = async (orderId) => {
  try {
    if (!mongoose.connection.readyState) {
      return memoryOrders.find((o) => o.orderId === orderId) || null;
    }

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
      createdAt: order.createdAt,
      productName: order.productName,
      quantity: order.quantity,
      items: order.items,
    };
  } catch (error) {
    console.warn(`MongoDB: Failed to get order ${orderId}, falling back to memory database. Error: ${error.message}`);
    return memoryOrders.find((o) => o.orderId === orderId) || null;
  }
};
