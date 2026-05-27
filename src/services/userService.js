const userRepository = require('../repositories/postgres/userRepository');

exports.getUserByEmail = async (email) => {
  return await userRepository.getUserByEmail(email);
};

exports.createUser = async (user) => {
  return await userRepository.createUser(user);
};

const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const USERS_TABLE = process.env.USERS_TABLE || 'EcommerceUsers';

// In-memory fallback database
const memoryUsers = {};

exports.getUserByEmail = async (email) => {
  try {
    const result = await ddb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { email },
    }));
    return result.Item;
  } catch (error) {
    console.warn(`DynamoDB: Failed to get user by email, falling back to memory database. Error: ${error.message}`);
    return memoryUsers[email] || null;
  }
};

exports.createUser = async (user) => {
  try {
    await ddb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: user,
        ConditionExpression: 'attribute_not_exists(email)',
      })
    );
    return user;
  } catch (error) {
    console.warn(`DynamoDB: Failed to create user, falling back to memory database. Error: ${error.message}`);
    if (memoryUsers[user.email]) {
      const err = new Error('ConditionalCheckFailedException');
      err.name = 'ConditionalCheckFailedException';
      throw err;
    }
    memoryUsers[user.email] = user;
    return user;
  }
};
