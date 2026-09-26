import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.statusCode).json({ message: err.message });
  logger.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
}
