const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const TOKEN_EXPIRES_IN = '7d';

const createToken = (user) =>
  jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await userService.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      userId: uuidv4(),
      name,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await userService.createUser(user);
    const token = createToken(user);

    return res.status(201).json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    return res.status(500).json({ error: 'Unable to create account' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await userService.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to log in' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to retrieve profile' });
  }
};
