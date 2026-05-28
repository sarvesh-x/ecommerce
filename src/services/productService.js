const productRepository = require('../repositories/mongodb/productRepository');

exports.getAllProducts = async () => {
  return await productRepository.getAllProducts();
};

exports.getProductById = async (id) => {
  return await productRepository.getProductById(id);
};

exports.createProduct = async (product) => {
  return await productRepository.createProduct(product);
};

exports.updateProduct = async (id, updates) => {
  return await productRepository.updateProduct(id, updates);
};

exports.deleteProduct = async (id) => {
  return await productRepository.deleteProduct(id);
};
