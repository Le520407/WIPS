import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Order } from '../models';

// Get all orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, status } = req.query;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const where: any = { user_id };
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

// Get single order
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const order = await Order.findOne({
      where: { id, user_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
};

// Create order (from webhook)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      userId,
      orderId,
      customerPhone,
      customerName,
      items,
      totalAmount,
      currency,
    } = req.body;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!orderId || !customerPhone || !items || !totalAmount) {
      return res.status(400).json({
        error: 'Order ID, customer phone, items, and total amount required',
      });
    }

    const order = await Order.create({
      user_id: user_id as string,
      order_id: orderId,
      customer_phone: customerPhone,
      customer_name: customerName,
      items,
      total_amount: totalAmount,
      currency: currency || 'USD',
      status: 'pending',
    });

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, userId } = req.body;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const order = await Order.findOne({
      where: { id, user_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status, notes });
    res.json({ success: true, order });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Delete order
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const deleted = await Order.destroy({
      where: { id, user_id },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

// Get order statistics
export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.query;
    const user_id = userId || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const [total, pending, processing, completed, cancelled] = await Promise.all([
      Order.count({ where: { user_id } }),
      Order.count({ where: { user_id, status: 'pending' } }),
      Order.count({ where: { user_id, status: 'processing' } }),
      Order.count({ where: { user_id, status: 'completed' } }),
      Order.count({ where: { user_id, status: 'cancelled' } }),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        processing,
        completed,
        cancelled,
      },
    });
  } catch (error: any) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Failed to get order statistics' });
  }
};
