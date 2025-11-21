import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/password.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { db } from '../utils/db.js';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const { email, password, name } = validation.data;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new AppError(passwordValidation.error!, 400);
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.createUser({
      id: randomUUID(),
      email,
      passwordHash,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await db.getUserById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const updateSchema = z.object({
      name: z.string().optional(),
    });

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400);
    }

    const updatedUser = await db.updateUser(req.user.userId, validation.data);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
