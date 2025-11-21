import type { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify token
    const payload = verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
}
