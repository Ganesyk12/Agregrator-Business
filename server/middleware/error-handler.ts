import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  status?: number
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.status || 500
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  })
}

export function createError(status: number, message: string): AppError {
  const error = new Error(message) as AppError
  error.status = status
  return error
}
