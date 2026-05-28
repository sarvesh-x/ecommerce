const userRepository = require('../repositories/mongodb/userRepository');

exports.getUserByEmail = async (email) => {
  return await userRepository.getUserByEmail(email);
};

exports.createUser = async (user) => {
  return await userRepository.createUser(user);
};

// Update user profile (name, email)
exports.updateUser = async (userId, updates) => {
  return await userRepository.updateUser(userId, updates);
};
