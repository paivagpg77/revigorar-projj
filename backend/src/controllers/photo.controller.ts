import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { WoundPhoto } from '../models/WoundPhoto';
import { AppError } from '../utils/AppError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Configuração do multer
const uploadDir = path.resolve(env.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Apenas imagens (jpg, png, webp, gif) são permitidas'));
  },
});

const repo = () => AppDataSource.getRepository(WoundPhoto);

export async function uploadPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw AppError.badRequest('Nenhum arquivo enviado');
    const { evaluation_id, sort_order, angle } = req.body;
    if (!evaluation_id) throw AppError.badRequest('ID da avaliação obrigatório');

    const photo = repo().create({
      evaluation_id,
      file_path: `/uploads/${req.file.filename}`,
      file_size: req.file.size,
      sort_order: parseInt(sort_order || '0'),
      angle,
    });
    await repo().save(photo);
    res.status(201).json({ status: 'ok', data: photo });
  } catch (err) { next(err); }
}

export async function listByEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await repo().find({
      where: { evaluation_id: req.params.evaluationId },
      order: { sort_order: 'ASC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const photo = await repo().findOneBy({ id: req.params.id });
    if (!photo) throw AppError.notFound();

    // Remover arquivo físico
    const filePath = path.resolve(uploadDir, path.basename(photo.file_path));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await repo().delete(photo.id);
    res.json({ status: 'ok', message: 'Foto removida' });
  } catch (err) { next(err); }
}
