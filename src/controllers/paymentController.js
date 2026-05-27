const orderService = require('../services/orderService');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const orders = await orderService.getOrdersByUser(req.user.userId);
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // In bypass mode, return a dummy razorpayOrder
      return res.json({
        order,
        razorpayOrder: {
          id: `fake_rzp_${Date.now()}`,
          amount: Math.round(order.total * 100),
          currency: 'INR',
          notes: { bypass: true },
        },
      });
    }

    const Razorpay = require('razorpay');
    const rzp = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await rzp.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: 'INR',
      receipt: order.orderId,
    });

    await orderService.updateOrder(req.user.userId, order.orderId, {
      razorpayOrderId: razorpayOrder.id,
    });

    return res.json({ order, razorpayOrder });
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    return res.status(500).json({ error: 'Unable to initiate payment' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, isBypass } = req.body;
    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment verification parameters' });
    }

    // Handle bypass mode if Razorpay is not configured OR the payment was bypassed in front-end
    if (!RAZORPAY_KEY_SECRET || isBypass) {
      console.log(`Payment verification bypassed for order ${orderId} (Demo/local mode).`);
      const updatedOrder = await orderService.updateOrder(req.user.userId, orderId, {
        status: 'paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: 'bypassed_signature',
        paymentCaptured: true,
        updatedAt: new Date().toISOString(),
      });

      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json({ success: true, order: updatedOrder, bypass: true });
    }

    if (!razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const updatedOrder = await orderService.updateOrder(req.user.userId, orderId, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentCaptured: true,
      updatedAt: new Date().toISOString(),
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: 'Unable to verify payment' });
  }
};
