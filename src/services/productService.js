const ddb = require('./dynamoClient');
const { GetCommand, PutCommand, ScanCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { products: sampleProducts } = require('../data/sampleData');

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE || 'EcommerceProducts';

// In-memory fallback database
let memoryProducts = [...sampleProducts];

// Helper to seed memory details
memoryProducts = memoryProducts.map(p => {
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
    image: '',
    rating: {
      rate: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      count: Math.floor(Math.random() * 150 + 10),
    },
    featured: p.price > 45,
  };
});

exports.getAllProducts = async () => {
  try {
    const result = await ddb.send(
      new ScanCommand({
        TableName: PRODUCTS_TABLE,
      })
    );
    return result.Items || [];
  } catch (error) {
    console.warn(`DynamoDB: Failed to get all products, falling back to memory database. Error: ${error.message}`);
    return memoryProducts;
  }
};

exports.getProductById = async (id) => {
  try {
    const result = await ddb.send(
      new GetCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id },
      })
    );
    return result.Item;
  } catch (error) {
    console.warn(`DynamoDB: Failed to get product ${id}, falling back to memory database. Error: ${error.message}`);
    return memoryProducts.find(p => p.id === id) || null;
  }
};

exports.createProduct = async (product) => {
  try {
    await ddb.send(
      new PutCommand({
        TableName: PRODUCTS_TABLE,
        Item: product,
      })
    );
    return product;
  } catch (error) {
    console.warn(`DynamoDB: Failed to create product, falling back to memory database. Error: ${error.message}`);
    memoryProducts.push(product);
    return product;
  }
};

exports.updateProduct = async (id, updates) => {
  try {
    const expressionParts = [];
    const expressionValues = {};
    const expressionNames = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const nameKey = `#key${index}`;
      const valueKey = `:value${index}`;
      expressionNames[nameKey] = key;
      expressionValues[valueKey] = value;
      expressionParts.push(`${nameKey} = ${valueKey}`);
    });

    if (!expressionParts.length) {
      return null;
    }

    const result = await ddb.send(
      new UpdateCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes;
  } catch (error) {
    console.warn(`DynamoDB: Failed to update product ${id}, falling back to memory database. Error: ${error.message}`);
    const index = memoryProducts.findIndex(p => p.id === id);
    if (index === -1) return null;
    memoryProducts[index] = { ...memoryProducts[index], ...updates };
    return memoryProducts[index];
  }
};

exports.deleteProduct = async (id) => {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: PRODUCTS_TABLE,
        Key: { id },
      })
    );
    return true;
  } catch (error) {
    console.warn(`DynamoDB: Failed to delete product ${id}, falling back to memory database. Error: ${error.message}`);
    const index = memoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryProducts.splice(index, 1);
    }
    return true;
  }
};
