import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email: string, password: string, name?: string }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login existing user
 * Body: { email: string, password: string }
 */
router.post('/login', login);

/**
 * GET /api/auth/profile
 * Get current user profile
 * Requires: Authorization header with Bearer token
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile
 * Requires: Authorization header with Bearer token
 * Body: { name?: string }
 */
router.put('/profile', authenticateToken, updateProfile);

export default router;
