import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthPayload { userId: string; email: string; }
declare global { namespace Express { interface Request { auth?: AuthPayload; } } }

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next(AppError.unauthorized('Token não fornecido'));
  try {
    req.auth = jwt.verify(h.slice(7), env.jwt.secret) as AuthPayload;
    next();
  } catch { next(AppError.unauthorized('Token inválido')); }
}

export function signToken(p: AuthPayload): string {
  return jwt.sign(p, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as any);
}
