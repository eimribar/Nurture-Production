import { Router } from 'express';
import { analyzeVideo, getQuickTips } from '../controllers/analysisController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/analysis/video
 * Analyze a baby's cry from video
 * Body: { videoBase64: string, mimeType: string }
 * Optional: Authorization header (saves to history if authenticated)
 */
router.post('/video', optionalAuth, analyzeVideo);

/**
 * GET /api/analysis/quick-tips
 * Get quick soothing tips
 */
router.get('/quick-tips', getQuickTips);

export default router;
