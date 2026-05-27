const db = require('../../config/db');

// In-memory fallback datasets
const memoryOrders = [];
const memoryOrderItems = [];

exports.createOrderTransaction = async (order, items) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert order
      await client.query(
        'INSERT INTO orders (id, user_id, total, status, razorpay_order_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          order.orderId,
          order.userId,
          order.total,
          order.status,
          order.razorpayOrderId || null,
          order.createdAt,
          order.createdAt,
        ]
      );

      // 2. Insert items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            item.id,
            order.orderId,
            item.productId,
            item.productName,
            item.quantity,
            item.price,
          ]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    memoryOrders.push(order);
    items.forEach((item) => {
      memoryOrderItems.push({ ...item, orderId: order.orderId });
    });
    return order;
  }
};

exports.getOrdersByUser = async (userId) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    // Query orders
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    const orders = ordersResult.rows;

    const populatedOrders = [];
    for (const o of orders) {
      const itemsResult = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [o.id]
      );
      populatedOrders.push({
        userId: o.user_id,
        orderId: o.id,
        total: parseFloat(o.total),
        status: o.status,
        razorpayOrderId: o.razorpay_order_id,
        createdAt: o.created_at,
        // Match front-end single-product expectation if only one, or array of items
        productName: itemsResult.rows[0]?.product_name || 'Premium Apparel',
        quantity: itemsResult.rows[0]?.quantity || 1,
        items: itemsResult.rows.map((row) => ({
          productId: row.product_id,
          productName: row.product_name,
          quantity: row.quantity,
          price: parseFloat(row.price),
        })),
      });
    }
    return populatedOrders;
  } else {
    return memoryOrders
      .filter((o) => o.userId === userId)
      .map((o) => {
        const items = memoryOrderItems.filter((item) => item.orderId === o.orderId);
        return {
          ...o,
          productName: items[0]?.productName || 'Premium Apparel',
          quantity: items[0]?.quantity || 1,
          items,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

exports.updateOrder = async (userId, orderId, updates) => {
  if (db.isPostgresActive()) {
    const pool = db.getPgPool();
    const setParts = [];
    const values = [];
    let valIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      // Map JS camelCase variables to SQL snake_case fields
      let dbField = key;
      if (key === 'razorpayOrderId') dbField = 'razorpay_order_id';
      
      setParts.push(`${dbField} = $${valIndex}`);
      values.push(value);
      valIndex++;
    });

    values.push(orderId);
    values.push(userId);

    const query = `
      UPDATE orders 
      SET ${setParts.join(', ')}, updated_at = NOW() 
      WHERE id = $${valIndex} AND user_id = $${valIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    const o = result.rows[0];
    return {
      orderId: o.id,
      userId: o.user_id,
      total: parseFloat(o.total),
      status: o.status,
      razorpayOrderId: o.razorpay_order_id,
      createdAt: o.created_at,
    };
  } else {
    const order = memoryOrders.find((o) => o.userId === userId && o.orderId === orderId);
    if (!order) return null;
    Object.assign(order, updates);
    return order;
  }
};
