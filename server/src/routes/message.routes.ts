import { Router } from 'express';
import multer from 'multer';
import { getMessages, sendMessage, getConversations, markConversationAsRead, uploadMedia, sendMediaMessageController, getMediaUrl, sendInteractiveButtonsController, sendInteractiveListController, sendInteractiveCTAController, sendLocationController, sendContactController, sendReactionController, sendTextWithContextController, sendStickerController, markMessageAsReadController, sendTypingIndicatorController, requestLocationController, sendAddressController, deleteMessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  }
});

router.use(authMiddleware);

router.get('/', getMessages);
router.post('/send', sendMessage);
router.get('/conversations', getConversations);
router.post('/conversations/:conversationId/read', markConversationAsRead);
router.post('/upload', upload.single('file'), uploadMedia);
router.post('/send-media', sendMediaMessageController);
router.post('/send-buttons', sendInteractiveButtonsController);
router.post('/send-list', sendInteractiveListController);
router.post('/send-cta', sendInteractiveCTAController);
router.post('/send-location', sendLocationController);
router.post('/send-contact', sendContactController);
router.post('/send-reaction', sendReactionController);
router.post('/send-reply', sendTextWithContextController);
router.post('/send-sticker', sendStickerController);
router.post('/mark-as-read', markMessageAsReadController);
router.post('/send-typing', sendTypingIndicatorController);
router.post('/request-location', requestLocationController);
router.post('/send-address', sendAddressController);
router.get('/media/:mediaId', getMediaUrl);
router.delete('/:messageId', deleteMessageController);

export default router;
