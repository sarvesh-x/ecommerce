const db = require('../../config/db');

// In-memory fallback stock database
const memoryInventory = {};

exports.checkStock = async (productId, requiredQty, client = null) => {
  if (db.isPostgresActive()) {
    const executor = client || db.getPgPool();
    const result = await executor.query(
      'SELECT stock FROM inventory WHERE product_id = $1',
      [productId]
    );
    if (result.rows.length === 0) return false;
    return result.rows[0].stock >= requiredQty;
  } else {
    const stock = memoryInventory[productId] !== undefined ? memoryInventory[productId] : 100; // default 100 stock
    return stock >= requiredQty;
  }
};

exports.deductStock = async (productId, quantity, client = null) => {
  if (db.isPostgresActive()) {
    const executor = client || db.getPgPool();
    await executor.query(
      'UPDATE inventory SET stock = stock - $1 WHERE product_id = $2',
      [quantity, productId]
    );
  } else {
    const stock = memoryInventory[productId] !== undefined ? memoryInventory[productId] : 100;
    memoryInventory[productId] = Math.max(0, stock - quantity);
  }
};

exports.setStock = async (productId, stock, client = null) => {
  if (db.isPostgresActive()) {
    const executor = client || db.getPgPool();
    await executor.query(
      'INSERT INTO inventory (product_id, stock, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (product_id) DO UPDATE SET stock = $2, updated_at = NOW()',
      [productId, stock]
    );
  } else {
    memoryInventory[productId] = stock;
  }
};
