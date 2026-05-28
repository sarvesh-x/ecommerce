const mongoose = require('mongoose');
const db = require('../../config/db');
const User = require('../../models/User');

async function ensureMongoConnection() {
  if (db.isMongoActive() && mongoose.connection.readyState === 1) return;

  const connected = await db.connectMongo();
  if (!connected) {
    throw new Error('MongoDB is unavailable. Start MongoDB or set MONGODB_URI to store credentials in ecommerce.users.');
  }
}

function toApiUser(user) {
  if (!user) return null;

  return {
    ...user,
    userId: user.userId || String(user._id),
  };
}

exports.getUserByEmail = async (email) => {
  await ensureMongoConnection();
  const user = await User.findOne({ email }).lean();
  return toApiUser(user);
};

exports.createUser = async (user) => {
  try {
    await ensureMongoConnection();
    const newUser = new User({
      userId: user.userId,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      createdAt: user.createdAt || new Date(),
    });
    await newUser.save();
    return toApiUser(newUser.toObject());
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('DuplicateEmail');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    throw error;
  }
};

// Update user profile (name, email) by userId
exports.updateUser = async (userId, updates) => {
  try {
    await ensureMongoConnection();
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    ).lean();
    return toApiUser(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('DuplicateEmail');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
    throw error;
  }
};
