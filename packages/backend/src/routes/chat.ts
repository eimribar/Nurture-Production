import { Router } from 'express';
import { sendChatMessage } from '../controllers/chatController.js';

const router = Router();

/**
 * POST /api/chat/message
 * Send a chat message and get AI response
 * Body: { message: string, history?: Array<{role: string, parts: string}> }
 */
router.post('/message', sendChatMessage);

export default router;
