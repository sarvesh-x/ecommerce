const db = require('../config/db');
const productRepository = require('../repositories/mongodb/productRepository');
const { products } = require('../data/sampleData');
require('dotenv').config();

function deriveProductMetadata(product) {
  let category = 'Casual';
  let gender = 'Unisex';
  const nameLower = product.name.toLowerCase();

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

  return { category, gender };
}

async function main() {
  const mongoConnected = await db.connectMongo();
  if (!mongoConnected) {
    console.warn('MongoDB is not configured or failed to connect. Setup aborted.');
    process.exit(1);
  }

  const existingProducts = await productRepository.getAllProducts();
  if (existingProducts.length > 0) {
    console.log('MongoDB already contains products. Skipping seed.');
    process.exit(0);
  }

  console.log(`Seeding ${products.length} products into MongoDB...`);
  for (const product of products) {
    const metadata = deriveProductMetadata(product);
    const seededProduct = {
      ...product,
      category: metadata.category,
      gender: metadata.gender,
      image: `/assets/placeholder-${product.id}.png`,
      rating: {
        rate: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        count: Math.floor(Math.random() * 150 + 10),
      },
      featured: product.price > 45,
      createdAt: new Date(),
    };

    await productRepository.createProduct(seededProduct);
    console.log(`Seeded product: ${product.name}`);
  }

  console.log('MongoDB product seed complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error during MongoDB setup:', error);
  process.exit(1);
});
