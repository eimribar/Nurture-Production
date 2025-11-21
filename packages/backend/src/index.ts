// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import analysisRouter from './routes/analysis.js';
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import historyRouter from './routes/history.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'capacitor://localhost',
    'ionic://localhost'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/chat', chatRouter);
app.use('/api/history', historyRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server only in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 NurtureAI Backend API running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Gemini API Key configured: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`🗄️  Supabase URL configured: ${!!process.env.SUPABASE_URL}`);
  });
}

// Export app for Vercel serverless functions
export default app;
