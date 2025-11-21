import { Router } from 'express';
import { getHistory, getHistoryItem, deleteHistoryItem } from '../controllers/historyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All history routes require authentication
router.use(authenticateToken);

/**
 * GET /api/history
 * Get all analysis history for current user
 * Requires: Authorization header with Bearer token
 */
router.get('/', getHistory);

/**
 * GET /api/history/:id
 * Get specific analysis by ID
 * Requires: Authorization header with Bearer token
 */
router.get('/:id', getHistoryItem);

/**
 * DELETE /api/history/:id
 * Delete specific analysis
 * Requires: Authorization header with Bearer token
 */
router.delete('/:id', deleteHistoryItem);

export default router;
