const mongoose = require('mongoose');
const db = require('../../config/db');
const User = require('../../models/User');

const memoryUsers = {};

exports.getUserByEmail = async (email) => {
  try {
    if (db.isMongoActive() && mongoose.connection.readyState) {
      return await User.findOne({ email }).lean();
    }
  } catch (error) {
    console.warn(`MongoDB: Failed to get user by email, falling back to memory database. Error: ${error.message}`);
  }

  return memoryUsers[email] || null;
};

exports.createUser = async (user) => {
  try {
    if (db.isMongoActive() && mongoose.connection.readyState) {
      const newUser = new User({
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        createdAt: user.createdAt || new Date(),
      });
      await newUser.save();
      return newUser.toObject();
    }
  } catch (error) {
    console.warn(`MongoDB: Failed to create user, falling back to memory database. Error: ${error.message}`);
    if (error.code === 11000 || error.name === 'MongoServerError') {
      const err = new Error('DuplicateEmail');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
  }

  if (memoryUsers[user.email]) {
    const err = new Error('DuplicateEmail');
    err.code = 'DUPLICATE_EMAIL';
    throw err;
  }

  memoryUsers[user.email] = user;
  return user;
};
