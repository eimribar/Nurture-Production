/**
 * Vercel Serverless Function Entry Point
 * This file serves as the entry point for Vercel serverless deployment
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import analysisRouter from '../src/routes/analysis.js';
import chatRouter from '../src/routes/chat.js';
import authRouter from '../src/routes/auth.js';
import historyRouter from '../src/routes/history.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('combined'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NurtureAI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      analysis: '/api/analysis',
      chat: '/api/chat',
      history: '/api/history'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/chat', chatRouter);
app.use('/api/history', historyRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
