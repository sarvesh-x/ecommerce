const orderRepository = require('../repositories/mongodb/orderRepository');

exports.createOrder = async (order) => {
  return await orderRepository.createOrder(order);
};

exports.getOrdersByUser = async (userId) => {
  return await orderRepository.getOrdersByUser(userId);
};

exports.updateOrder = async (orderId, updates) => {
  return await orderRepository.updateOrder(orderId, updates);
};

exports.getOrderById = async (orderId) => {
  return await orderRepository.getOrderById(orderId);
};
