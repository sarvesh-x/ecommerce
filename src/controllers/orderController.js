const { products, orders } = require('../data/sampleData');

exports.getAllOrders = (req, res) => {
  res.json(orders);
};

exports.createOrder = (req, res) => {
  const { productId, quantity, customerName, shippingAddress } = req.body;
  if (!productId || quantity == null) {
    return res.status(400).json({ error: 'productId and quantity are required' });
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const order = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId,
    quantity,
    customerName: customerName || 'Guest',
    shippingAddress: shippingAddress || '',
    total: product.price * quantity,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  res.status(201).json(order);
};
