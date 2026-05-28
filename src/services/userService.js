const userRepository = require('../repositories/mongodb/userRepository');

exports.getUserByEmail = async (email) => {
  return await userRepository.getUserByEmail(email);
};

exports.createUser = async (user) => {
  return await userRepository.createUser(user);
};
