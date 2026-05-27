const db = require('../../config/db');

// In-memory fallback dataset
const memoryUsers = {};

exports.getUserByEmail = async (email) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    const u = result.rows[0];
    return {
      userId: u.id,
      name: u.name,
      email: u.email,
      passwordHash: u.password_hash,
      createdAt: u.created_at,
    };
  } else {
    return memoryUsers[email] || null;
  }
};

exports.createUser = async (user) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)',
      [user.userId, user.name, user.email, user.passwordHash, user.createdAt]
    );
    return user;
  } else {
    if (memoryUsers[user.email]) {
      const err = new Error('ConditionalCheckFailed');
      err.code = '23505'; // PostgreSQL unique constraint violation code
      throw err;
    }
    memoryUsers[user.email] = user;
    return user;
  }
};
