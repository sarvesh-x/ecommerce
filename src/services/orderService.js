const ddb = require('./dynamoClient');
const { PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'EcommerceOrders';

// In-memory fallback database
const memoryOrders = [];

exports.createOrder = async (order) => {
  try {
    await ddb.send(
      new PutCommand({
        TableName: ORDERS_TABLE,
        Item: order,
      })
    );
    return order;
  } catch (error) {
    console.warn(`DynamoDB: Failed to create order, falling back to memory database. Error: ${error.message}`);
    memoryOrders.push(order);
    return order;
  }
};

exports.getOrdersByUser = async (userId) => {
  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: ORDERS_TABLE,
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
          ':uid': userId,
        },
        ScanIndexForward: false,
      })
    );
    return result.Items || [];
  } catch (error) {
    console.warn(`DynamoDB: Failed to query orders for user ${userId}, falling back to memory database. Error: ${error.message}`);
    return memoryOrders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

exports.updateOrder = async (userId, orderId, updates) => {
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
        TableName: ORDERS_TABLE,
        Key: { userId, orderId },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes;
  } catch (error) {
    console.warn(`DynamoDB: Failed to update order ${orderId}, falling back to memory database. Error: ${error.message}`);
    const order = memoryOrders.find((o) => o.userId === userId && o.orderId === orderId);
    if (!order) return null;
    
    Object.assign(order, updates);
    return order;
  }
};
