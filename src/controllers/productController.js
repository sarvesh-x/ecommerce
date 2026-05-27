const { products } = require('../data/sampleData');

exports.getAllProducts = (req, res) => {
  res.json(products);
};

exports.getProductById = (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
};

exports.createProduct = (req, res) => {
  const { name, price, description, inventory, sizes, colors } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newProduct = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    price,
    description: description || '',
    inventory: inventory != null ? inventory : 0,
    sizes: Array.isArray(sizes) ? sizes : [],
    colors: Array.isArray(colors) ? colors : [],
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};

exports.updateProduct = (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, price, description, inventory, sizes, colors } = req.body;
  if (name != null) product.name = name;
  if (price != null) product.price = price;
  if (description != null) product.description = description;
  if (inventory != null) product.inventory = inventory;
  if (sizes != null) product.sizes = Array.isArray(sizes) ? sizes : product.sizes;
  if (colors != null) product.colors = Array.isArray(colors) ? colors : product.colors;

  res.json(product);
};

exports.deleteProduct = (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  res.status(204).send();
};
