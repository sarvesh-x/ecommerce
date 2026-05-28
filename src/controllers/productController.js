const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Unable to retrieve products:', error.message);
    res.status(500).json({ error: error.message || 'Unable to retrieve products' });
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
    console.error('Unable to retrieve product details:', error.message);
    res.status(500).json({ error: error.message || 'Unable to retrieve product details' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const body = req.body;
    const title = body.title || body.name;
    const price = body.pricing?.salePrice ?? body.pricing?.price ?? body.salePrice ?? body.price;

    if (!title || price == null) {
      return res.status(400).json({ error: 'Product title/name and price are required' });
    }

    const newProduct = {
      ...body,
      productId: body.productId || body.id || `SKT-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
    };

    const createdProduct = await productService.createProduct(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Product with this productId or slug already exists' });
    }
    console.error('Unable to create product:', error.message);
    res.status(500).json({ error: error.message || 'Unable to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Product with this productId or slug already exists' });
    }
    console.error('Unable to update product:', error.message);
    res.status(500).json({ error: error.message || 'Unable to update product' });
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
    console.error('Unable to delete product:', error.message);
    res.status(500).json({ error: error.message || 'Unable to delete product' });
  }
};
