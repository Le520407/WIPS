import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} from '../controllers/order.controller';

const router = express.Router();

// Order management
router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
