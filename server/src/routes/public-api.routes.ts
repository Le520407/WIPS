import { Router } from 'express';
import { apiKeyAuth, ApiKeyRequest } from '../middleware/api-key-auth.middleware';
import messageRouter from '../services/message-router.service';

const router = Router();

/**
 * Public API Routes
 * These routes require API key authentication
 * Used by external websites to send messages
 */

/**
 * @route POST /api/v1/messages/send
 * @desc Send a message via WhatsApp
 * @access Public (requires API key)
 */
router.post('/messages/send', apiKeyAuth, async (req: ApiKeyRequest, res) => {
  try {
    const { to, type, text, image, video, audio, document, template } = req.body;
    const websiteId = req.website!.id;

    // Validate required fields
    if (!to) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'The "to" field is required'
      });
    }

    if (!type) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'The "type" field is required'
      });
    }

    // Send message
    const result = await messageRouter.sendMessage(websiteId, {
      to,
      type,
      text,
      image,
      video,
      audio,
      document,
      template
    });

    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to send message',
        message: result.error
      });
    }

    res.json({
      success: true,
      messageId: result.messageId,
      data: result.data
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/messages/history
 * @desc Get message history
 * @access Public (requires API key)
 */
router.get('/messages/history', apiKeyAuth, async (req: ApiKeyRequest, res) => {
  try {
    const websiteId = req.website!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await messageRouter.getMessageHistory(websiteId, limit, offset);

    res.json({
      success: true,
      messages,
      pagination: {
        limit,
        offset,
        total: messages.length
      }
    });
  } catch (error: any) {
    console.error('Get message history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/messages/stats
 * @desc Get message statistics
 * @access Public (requires API key)
 */
router.get('/messages/stats', apiKeyAuth, async (req: ApiKeyRequest, res) => {
  try {
    const websiteId = req.website!.id;
    const days = parseInt(req.query.days as string) || 30;

    const stats = await messageRouter.getMessageStats(websiteId, days);

    res.json({
      success: true,
      stats,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/v1/health
 * @desc Health check endpoint
 * @access Public (requires API key)
 */
router.get('/health', apiKeyAuth, async (req: ApiKeyRequest, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    website: {
      id: req.website!.id,
      phoneNumberId: req.website!.phoneNumberId
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
