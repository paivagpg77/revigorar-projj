import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Institution } from '../models/Institution';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Institution);

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await repo().findOneBy({ user_id: req.auth!.userId });
    if (!inst) {
      inst = repo().create({ user_id: req.auth!.userId });
      await repo().save(inst);
    }
    res.json({ status: 'ok', data: inst });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await repo().findOneBy({ user_id: req.auth!.userId });
    if (!inst) {
      inst = repo().create({ user_id: req.auth!.userId });
    }
    const allowed = ['name', 'cnpj', 'email', 'phone', 'address', 'logo_url'] as const;
    for (const k of allowed) if (req.body[k] !== undefined) (inst as any)[k] = req.body[k];
    await repo().save(inst);
    res.json({ status: 'ok', data: inst });
  } catch (err) { next(err); }
}
