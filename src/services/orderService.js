const orderRepository = require('../repositories/mongodb/orderRepository');

exports.createOrder = async (order) => {
  return await orderRepository.createOrder(order);
};

exports.getOrdersByUser = async (userId) => {
  return await orderRepository.getOrdersByUser(userId);
};

exports.updateOrder = async (userIdOrOrderId, orderIdOrUpdates, maybeUpdates) => {
  if (maybeUpdates) {
    return await orderRepository.updateOrder(userIdOrOrderId, orderIdOrUpdates, maybeUpdates);
  }

  return await orderRepository.updateOrder(null, userIdOrOrderId, orderIdOrUpdates);
};

exports.getOrderById = async (orderId) => {
  return await orderRepository.getOrderById(orderId);
};
