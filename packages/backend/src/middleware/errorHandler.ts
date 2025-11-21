import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Programming or unknown errors: don't leak details
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
}
