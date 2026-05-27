const orderService = require('../services/orderService');
const productService = require('../services/productService');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve orders' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, customerName, shippingAddress } = req.body;
    if (!productId || quantity == null || quantity <= 0) {
      return res.status(400).json({ error: 'productId and a positive quantity are required' });
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const orderId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const total = parseFloat((product.price * quantity).toFixed(2));

    const order = {
      userId: req.user.userId,
      orderId,
      productId,
      productName: product.name,
      quantity: parseInt(quantity, 10),
      customerName: customerName || req.user.name || 'Guest',
      shippingAddress: shippingAddress || '',
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await orderService.createOrder(order);

    // Integrate Razorpay order creation if keys are set
    let razorpayOrder = null;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      try {
        const Razorpay = require('razorpay');
        const rzp = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        razorpayOrder = await rzp.orders.create({
          amount: Math.round(total * 100), // Razorpay expects paise (cents)
          currency: 'INR',
          receipt: orderId,
        });

        // Save Razorpay order ID to our order
        order.razorpayOrderId = razorpayOrder.id;
        await orderService.updateOrder(order.userId, order.orderId, {
          razorpayOrderId: razorpayOrder.id,
        });
      } catch (rzpError) {
        console.error('Failed to create Razorpay order:', rzpError);
        // We still return the local order so they can check out via demo bypass if needed
      }
    }

    res.status(201).json({ order, razorpayOrder });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
};
