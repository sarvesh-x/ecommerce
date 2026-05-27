const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
  // Add additional fields as needed
});

let UserModel;
try {
  UserModel = mongoose.model('User', UserSchema);
} catch (e) {
  UserModel = mongoose.models.User;
}

module.exports = UserModel;
