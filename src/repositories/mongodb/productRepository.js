const mongoose = require('mongoose');
const db = require('../../config/db');

const ProductSchema = new mongoose.Schema({
  productId: { type: String, index: true, unique: true, sparse: true },
  title: { type: String, index: true },
  slug: { type: String, index: true, unique: true, sparse: true },
  description: {
    short: String,
    full: String,
  },
  brand: {
    name: String,
    slug: String,
  },
  category: { type: String, index: true },
  subCategory: String,
  tags: [String],
  media: {
    thumbnail: String,
    images: [{
      url: String,
      alt: String,
    }],
  },
  pricing: {
    currency: { type: String, default: 'INR' },
    price: Number,
    salePrice: Number,
    discountPercentage: Number,
    costPrice: Number,
  },
  inventory: {
    sku: String,
    stock: Number,
    reservedStock: Number,
    availability: String,
  },
  specifications: { type: Map, of: mongoose.Schema.Types.Mixed },
  variants: [{
    variantId: String,
    size: String,
    color: String,
    price: Number,
    stock: Number,
  }],
  rating: {
    average: Number,
    rate: Number,
    count: Number,
  },
  status: { type: String, default: 'active', index: true },

  // Legacy flat fields are kept sparse so older seed data and API clients still work.
  id: { type: String, index: true, unique: true, sparse: true },
  name: String,
  price: Number,
  sizes: [String],
  colors: [String],
  gender: { type: String },
  image: { type: String },
  featured: { type: Boolean, default: false },
  attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { strict: false, collection: 'products' });

let ProductModel = null;
try {
  ProductModel = mongoose.model('Product', ProductSchema);
} catch (e) {
  ProductModel = mongoose.models.Product;
}

function normalizeCategory(category = '') {
  const value = String(category).toLowerCase();
  if (value.includes('complete')) return 'Completes';
  if (value.includes('deck')) return 'Decks';
  if (value.includes('part') || value.includes('truck') || value.includes('wheel') || value.includes('bearing') || value.includes('hardware') || value.includes('grip')) return 'Parts';
  if (value.includes('helmet') || value.includes('safety')) return 'Parts';
  if (value.includes('accessor')) return 'Accessories';
  return category || 'Gear';
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean).map(String))];
}

function getProductQuery(id) {
  const query = [
    { productId: id },
    { id },
    { slug: id },
  ];

  if (mongoose.Types.ObjectId.isValid(id)) {
    query.push({ _id: id });
  }

  return { $or: query };
}

function toApiProduct(product) {
  if (!product) return null;

  const variants = Array.isArray(product.variants)
    ? product.variants.map((variant, index) => ({
      ...variant,
      variantId: variant.variantId || variant.varientId || `${product.productId || product.id || product._id}-VAR-${index + 1}`,
    }))
    : [];
  const sizes = product.sizes?.length ? product.sizes : uniqueValues(variants.map(v => v.size));
  const colors = product.colors?.length ? product.colors : uniqueValues(variants.map(v => v.color));
  const description = typeof product.description === 'string'
    ? product.description
    : product.description?.short || product.description?.full || '';
  const price = product.pricing?.salePrice ?? product.pricing?.price ?? product.price ?? 0;
  const originalPrice = product.pricing?.price ?? product.price ?? price;
  const image = product.media?.thumbnail || product.media?.images?.[0]?.url || product.image || '';
  const ratingAverage = product.rating?.average ?? product.rating?.rate ?? 4.5;
  const inventoryStock = product.inventory?.stock ?? product.inventory ?? 0;
  const reservedStock = product.inventory?.reservedStock ?? 0;

  return {
    ...product,
    id: product.productId || product.id || String(product._id),
    productId: product.productId || product.id || String(product._id),
    name: product.title || product.name || 'Untitled Product',
    title: product.title || product.name || 'Untitled Product',
    description,
    fullDescription: typeof product.description === 'object' ? product.description?.full : description,
    price,
    originalPrice,
    salePrice: product.pricing?.salePrice ?? price,
    discountPercentage: product.pricing?.discountPercentage ?? 0,
    currency: product.pricing?.currency || 'INR',
    sizes,
    colors,
    category: normalizeCategory(product.category || product.gender),
    rawCategory: product.category,
    gender: normalizeCategory(product.category || product.gender),
    image,
    images: product.media?.images || [],
    brand: product.brand || null,
    subCategory: product.subCategory || '',
    tags: product.tags || [],
    specifications: product.specifications || {},
    variants,
    inventory: inventoryStock,
    reservedStock,
    availableStock: Math.max(Number(inventoryStock) - Number(reservedStock), 0),
    availability: product.inventory?.availability || (Number(inventoryStock) > 0 ? 'in-stock' : 'out-of-stock'),
    sku: product.inventory?.sku,
    rating: {
      rate: ratingAverage,
      average: ratingAverage,
      count: product.rating?.count ?? 0,
    },
    featured: product.featured ?? Boolean(product.pricing?.discountPercentage || product.pricing?.salePrice),
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toMongoProduct(product) {
  const title = product.title || product.name;
  const productId = product.productId || product.id || `SKT-${Date.now()}`;
  const mongoId = product._id?.$oid || product._id;
  const salePrice = product.salePrice ?? product.price ?? product.pricing?.salePrice ?? product.pricing?.price;
  const listPrice = product.originalPrice ?? product.pricing?.price ?? product.price ?? salePrice;
  const description = typeof product.description === 'string'
    ? { short: product.description, full: product.description }
    : product.description || {};

  return {
    ...product,
    _id: mongoId,
    productId,
    title,
    slug: product.slug || slugify(title || productId),
    description,
    category: product.category || 'complete-skateboard',
    media: product.media || {
      thumbnail: product.image || '',
      images: product.image ? [{ url: product.image, alt: title || productId }] : [],
    },
    pricing: {
      currency: product.pricing?.currency || product.currency || 'INR',
      price: Number(listPrice ?? salePrice ?? 0),
      salePrice: Number(salePrice ?? listPrice ?? 0),
      discountPercentage: product.pricing?.discountPercentage ?? product.discountPercentage ?? 0,
      costPrice: product.pricing?.costPrice ?? product.costPrice,
    },
    inventory: typeof product.inventory === 'object'
      ? product.inventory
      : {
        sku: product.sku || productId,
        stock: Number(product.inventory ?? product.stock ?? 0),
        reservedStock: 0,
        availability: Number(product.inventory ?? product.stock ?? 0) > 0 ? 'in-stock' : 'out-of-stock',
      },
    variants: product.variants || uniqueValues([...(product.sizes || []), ...(product.colors || [])]).map((value, index) => ({
      variantId: `${productId}-VAR-${index + 1}`,
      size: product.sizes?.[index] || product.sizes?.[0] || value,
      color: product.colors?.[index] || product.colors?.[0] || 'Standard',
      price: Number(salePrice ?? listPrice ?? 0),
      stock: Number(product.inventory?.stock ?? product.inventory ?? product.stock ?? 0),
    })),
    rating: {
      average: product.rating?.average ?? product.rating?.rate ?? 4.5,
      count: product.rating?.count ?? 0,
    },
    status: product.status || 'active',
    updatedAt: new Date(),
  };
}

function toMongoUpdates(updates) {
  const mapped = {};

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) return;

    if (key === 'name') mapped.title = value;
    else if (key === 'price') mapped['pricing.salePrice'] = Number(value);
    else if (key === 'description' && typeof value === 'string') {
      mapped['description.short'] = value;
      mapped['description.full'] = value;
    } else if (key === 'inventory' && typeof value !== 'object') {
      mapped['inventory.stock'] = Number(value);
      mapped['inventory.availability'] = Number(value) > 0 ? 'in-stock' : 'out-of-stock';
    } else if (key === 'image') {
      mapped['media.thumbnail'] = value;
      mapped['media.images'] = value ? [{ url: value, alt: updates.name || 'Product image' }] : [];
    } else {
      mapped[key] = value;
    }
  });

  mapped.updatedAt = new Date();
  return mapped;
}

async function ensureMongoConnection() {
  if (db.isMongoActive()) return true;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Set MONGODB_URI or start local MongoDB at mongodb://localhost:27017/ecommerce.');
  }

  return true;
}

exports.getAllProducts = async () => {
  await ensureMongoConnection();
  const products = await ProductModel.find({ status: { $ne: 'deleted' } }).lean();
  return products.map(toApiProduct);
};

exports.getProductById = async (id) => {
  await ensureMongoConnection();
  const product = await ProductModel.findOne(getProductQuery(id)).lean();
  return toApiProduct(product);
};

exports.createProduct = async (product) => {
  const mongoProduct = toMongoProduct(product);
  await ensureMongoConnection();
  const p = new ProductModel(mongoProduct);
  await p.save();
  return toApiProduct(p.toObject());
};

exports.updateProduct = async (id, updates) => {
  await ensureMongoConnection();
  const updated = await ProductModel.findOneAndUpdate(
    getProductQuery(id),
    { $set: toMongoUpdates(updates) },
    { new: true }
  ).lean();
  return toApiProduct(updated);
};

exports.deleteProduct = async (id) => {
  await ensureMongoConnection();
  await ProductModel.deleteOne(getProductQuery(id));
  return true;
};

exports.clearAllProducts = async () => {
  await ensureMongoConnection();
  await ProductModel.deleteMany({});
};
