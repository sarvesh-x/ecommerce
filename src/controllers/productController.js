const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve product details' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, inventory, sizes, colors, category, gender } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newProduct = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      price: parseFloat(price),
      description: description || '',
      inventory: inventory != null ? parseInt(inventory, 10) : 0,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      category: category || 'Casual',
      gender: gender || 'Unisex',
      createdAt: new Date().toISOString(),
    };

    await productService.createProduct(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price, description, inventory, sizes, colors, category, gender } = req.body;
    const updates = {};
    if (name != null) updates.name = name;
    if (price != null) updates.price = parseFloat(price);
    if (description != null) updates.description = description;
    if (inventory != null) updates.inventory = parseInt(inventory, 10);
    if (sizes != null) updates.sizes = Array.isArray(sizes) ? sizes : [sizes];
    if (colors != null) updates.colors = Array.isArray(colors) ? colors : [colors];
    if (category != null) updates.category = category;
    if (gender != null) updates.gender = gender;

    const updatedProduct = await productService.updateProduct(req.params.id, updates);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Unable to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete product' });
  }
};
