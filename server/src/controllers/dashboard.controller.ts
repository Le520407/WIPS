import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Template from '../models/Template';
import Call from '../models/Call';
import { Op } from 'sequelize';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch message stats
    const totalMessages = await Message.count({
      where: { user_id: userId },
    });

    const messagesThisWeek = await Message.count({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: oneWeekAgo },
      },
    });

    const messagesThisMonth = await Message.count({
      where: {
        user_id: userId,
        created_at: { [Op.gte]: oneMonthAgo },
      },
    });

    // Fetch conversation stats
    const totalConversations = await Conversation.count({
      where: { user_id: userId },
    });

    const activeConversations = await Conversation.count({
      where: {
        user_id: userId,
        last_message_time: { [Op.gte]: oneWeekAgo },
      },
    });

    // Fetch template stats
    const templatesCount = await Template.count({
      where: { user_id: userId },
    });

    // Fetch call stats
    const totalCalls = await Call.count({
      where: { user_id: userId },
    });

    const callsThisWeek = await Call.count({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: oneWeekAgo },
      },
    });

    const callsThisMonth = await Call.count({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: oneMonthAgo },
      },
    });

    const stats = {
      totalMessages,
      totalConversations,
      activeConversations,
      templatesCount,
      messagesThisWeek,
      messagesThisMonth,
      totalCalls,
      callsThisWeek,
      callsThisMonth,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
