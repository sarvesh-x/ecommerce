require('dotenv').config();

const db = require('../config/db');
const productRepository = require('../repositories/mongodb/productRepository');
const { products } = require('../data/sampleData');

function deriveProductMetadata(product) {
  let category = 'Completes';
  let gender = 'Completes';
  const nameLower = product.name.toLowerCase();

  if (nameLower.includes('complete')) {
    category = 'Completes';
    gender = 'Completes';
  } else if (nameLower.includes('deck')) {
    category = 'Decks';
    gender = 'Decks';
  } else if (nameLower.includes('truck') || nameLower.includes('wheels') || nameLower.includes('bearings') || nameLower.includes('grip') || nameLower.includes('helmet')) {
    category = 'Parts';
    gender = 'Parts';
  } else {
    category = 'Accessories';
    gender = 'Accessories';
  }

  return { category, gender };
}

async function main() {
  const mongoConnected = await db.connectMongo();
  if (!mongoConnected) {
    console.warn('MongoDB is not configured or failed to connect. Setup aborted.');
    process.exit(1);
  }

  console.log('Clearing existing products from MongoDB to ensure fresh skateboard seed...');
  await productRepository.clearAllProducts();

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
