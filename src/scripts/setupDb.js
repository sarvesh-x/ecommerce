const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { products } = require('../data/sampleData');
require('dotenv').config();

const clientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
  console.log(`Connecting to local DynamoDB at ${process.env.DYNAMODB_ENDPOINT}`);
}

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const client = new DynamoDBClient(clientConfig);
const ddbDoc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const USERS_TABLE = process.env.USERS_TABLE || 'EcommerceUsers';
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'EcommerceProducts';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'EcommerceOrders';

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(tableName, keySchema, attributeDefinitions) {
  console.log(`Creating table ${tableName}...`);
  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
      BillingMode: 'PAY_PER_REQUEST',
    })
  );
  console.log(`Table ${tableName} creation initiated.`);
  
  // Wait until active
  let isActive = false;
  while (!isActive) {
    console.log(`Waiting for table ${tableName} to become active...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (desc.Table.TableStatus === 'ACTIVE') {
      isActive = true;
    }
  }
  console.log(`Table ${tableName} is now ACTIVE.`);
}

async function seedProducts() {
  console.log(`Checking if products need to be seeded in ${PRODUCTS_TABLE}...`);
  const existing = await ddbDoc.send(new ScanCommand({ TableName: PRODUCTS_TABLE, Limit: 1 }));
  
  if (existing.Items && existing.Items.length > 0) {
    console.log(`Products table already contains items. Skipping seed.`);
    return;
  }

  console.log(`Seeding ${products.length} products into ${PRODUCTS_TABLE}...`);
  for (const product of products) {
    // Add category/gender information to make filters work beautifully on front-end
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

    const seededProduct = {
      ...product,
      category,
      gender,
      image: `/assets/placeholder-${product.id}.png`, // Dynamic local path
      rating: {
        rate: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
        count: Math.floor(Math.random() * 150 + 10),
      },
      featured: product.price > 45, // Feature products with price > 45 in carousel
    };

    await ddbDoc.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: seededProduct,
      })
    );
    console.log(`Seeded product: ${product.name}`);
  }
  console.log('Seeding completed successfully.');
}

async function main() {
  try {
    // 1. Users Table
    const usersCreated = await tableExists(USERS_TABLE);
    if (!usersCreated) {
      await createTable(
        USERS_TABLE,
        [{ AttributeName: 'email', KeyType: 'HASH' }],
        [{ AttributeName: 'email', AttributeType: 'S' }]
      );
    } else {
      console.log(`Table ${USERS_TABLE} already exists.`);
    }

    // 2. Products Table
    const productsCreated = await tableExists(PRODUCTS_TABLE);
    if (!productsCreated) {
      await createTable(
        PRODUCTS_TABLE,
        [{ AttributeName: 'id', KeyType: 'HASH' }],
        [{ AttributeName: 'id', AttributeType: 'S' }]
      );
    } else {
      console.log(`Table ${PRODUCTS_TABLE} already exists.`);
    }

    // 3. Orders Table
    const ordersCreated = await tableExists(ORDERS_TABLE);
    if (!ordersCreated) {
      await createTable(
        ORDERS_TABLE,
        [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'orderId', KeyType: 'RANGE' },
        ],
        [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'orderId', AttributeType: 'S' },
        ]
      );
    } else {
      console.log(`Table ${ORDERS_TABLE} already exists.`);
    }

    // 4. Seed Products
    await seedProducts();
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

main();
