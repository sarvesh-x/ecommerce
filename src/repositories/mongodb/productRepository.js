const mongoose = require('mongoose');
const db = require('../../config/db');
const { products: sampleProducts } = require('../../data/sampleData');

// 1. Mongoose Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  sizes: [String],
  colors: [String],
  category: { type: String },
  gender: { type: String },
  image: { type: String },
  featured: { type: Boolean, default: false },
  attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
  rating: {
    rate: { type: Number, default: 4.5 },
    count: { type: Number, default: 20 },
  },
  createdAt: { type: Date, default: Date.now },
});

let ProductModel = null;
try {
  ProductModel = mongoose.model('Product', ProductSchema);
} catch (e) {
  ProductModel = mongoose.models.Product;
}

// In-memory fallback catalog
let memoryProducts = [...sampleProducts].map(p => {
  let category = 'Casual';
  let gender = 'Unisex';

  const nameLower = p.name.toLowerCase();
  if (nameLower.includes('t-shirt') || nameLower.includes('shirt') || nameLower.includes('polo') || nameLower.includes('crop top')) {
    category = 'Tops';
  } else if (nameLower.includes('jeans') || nameLower.includes('pants') || nameLower.includes('shorts') || nameLower.includes('chino')) {
    category = 'Bottoms';
  } else if (nameLower.includes('jacket') || nameLower.includes('hoodie') || nameLower.includes('cardigan') || nameLower.includes('coat')) {
    category = 'Outerwear';
  } else if (nameLower.includes('dress')) {
    category = 'Dresses';
  } else if (nameLower.includes('belt') || nameLower.includes('hat') || nameLower.includes('bag')) {
    category = 'Accessories';
  }

  if (nameLower.includes('dress') || nameLower.includes('crop top') || nameLower.includes('summer dress')) {
    gender = 'Women';
  } else if (nameLower.includes('polo') || nameLower.includes('chino') || nameLower.includes('straight-leg jeans')) {
    gender = 'Men';
  }

  return {
    ...p,
    category,
    gender,
    rating: { rate: 4.5, count: 20 },
    featured: p.price > 45,
  };
});

exports.getAllProducts = async () => {
  if (db.isMongoActive()) {
    return await ProductModel.find().lean();
  } else {
    return memoryProducts;
  }
};

exports.getProductById = async (id) => {
  if (db.isMongoActive()) {
    return await ProductModel.findOne({ id }).lean();
  } else {
    return memoryProducts.find(p => p.id === id) || null;
  }
};

exports.createProduct = async (product) => {
  if (db.isMongoActive()) {
    const p = new ProductModel(product);
    await p.save();
    return p.toObject();
  } else {
    memoryProducts.push(product);
    return product;
  }
};

exports.updateProduct = async (id, updates) => {
  if (db.isMongoActive()) {
    const updated = await ProductModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated;
  } else {
    const index = memoryProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    memoryProducts[index] = { ...memoryProducts[index], ...updates };
    return memoryProducts[index];
  }
};

exports.deleteProduct = async (id) => {
  if (db.isMongoActive()) {
    await ProductModel.deleteOne({ id });
    return true;
  } else {
    const index = memoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryProducts.splice(index, 1);
    }
    return true;
  }
};
