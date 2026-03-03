const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// All routes are protected with auth middleware
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getAllOrders);
router.get('/pending', auth, orderController.getPendingOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/status', auth, orderController.updateOrderStatus);
router.put('/:id', auth, orderController.updateOrder);  // This is likely line 12
router.post('/:id/bill', auth, orderController.generateBill);

module.exports = router;