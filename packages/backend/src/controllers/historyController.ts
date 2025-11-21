import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../utils/db.js';

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const analyses = await db.getAnalysisByUserId(req.user.userId);

    res.json({
      status: 'success',
      data: {
        analyses,
        count: analyses.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistoryItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const analysis = await db.getAnalysisById(id);

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    // Ensure user owns this analysis
    if (analysis.userId !== req.user.userId) {
      throw new AppError('Unauthorized', 403);
    }

    res.json({
      status: 'success',
      data: { analysis },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHistoryItem(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const analysis = await db.getAnalysisById(id);

    if (!analysis) {
      throw new AppError('Analysis not found', 404);
    }

    // Ensure user owns this analysis
    if (analysis.userId !== req.user.userId) {
      throw new AppError('Unauthorized', 403);
    }

    await db.deleteAnalysis(id);

    res.json({
      status: 'success',
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
