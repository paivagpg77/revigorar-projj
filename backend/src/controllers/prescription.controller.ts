import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Prescription } from '../models/Prescription';
import { AppError } from '../utils/AppError';

const repo = () => AppDataSource.getRepository(Prescription);

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: any = { user_id: req.auth!.userId };
    if (status) where.status = status;

    const data = await repo().find({
      where, relations: ['patient'], order: { created_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, category, description } = req.body;
    if (!patient_id || !category || !description) throw AppError.badRequest('Paciente, categoria e descrição obrigatórios');

    const p = repo().create({ user_id: req.auth!.userId, patient_id, category, description });
    await repo().save(p);
    res.status(201).json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!p) throw AppError.notFound();
    p.status = 'completed';
    p.completed_at = new Date();
    await repo().save(p);
    res.json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

export async function reopen(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await repo().findOneBy({ id: req.params.id, user_id: req.auth!.userId });
    if (!p) throw AppError.notFound();
    p.status = 'active';
    p.completed_at = null as any;
    await repo().save(p);
    res.json({ status: 'ok', data: p });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await repo().delete({ id: req.params.id, user_id: req.auth!.userId });
    if (!result.affected) throw AppError.notFound();
    res.json({ status: 'ok', message: 'Prescrição removida' });
  } catch (err) { next(err); }
}
