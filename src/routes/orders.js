const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.post('/:orderId/cancel', orderController.cancelOrder);
router.patch('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;
