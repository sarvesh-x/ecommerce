const wishlistRepository = require('../repositories/mongodb/wishlistRepository');

exports.getWishlist = async (userId) => {
  return await wishlistRepository.getWishlist(userId);
};

exports.addToWishlist = async (userId, productId) => {
  return await wishlistRepository.addToWishlist(userId, productId);
};

exports.removeFromWishlist = async (userId, productId) => {
  return await wishlistRepository.removeFromWishlist(userId, productId);
};
