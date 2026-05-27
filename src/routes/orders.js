const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);

module.exports = router;
