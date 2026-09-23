import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { EstomiaEvaluation } from '../models/EstomiaEvaluation';
import { LaserSession } from '../models/LaserSession';
import { PodiatryEvaluation } from '../models/PodiatryEvaluation';
import { AppError } from '../utils/AppError';

// ── ESTOMIA ──────────────────────────────
const estomiaRepo = () => AppDataSource.getRepository(EstomiaEvaluation);

export async function listEstomias(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await estomiaRepo().find({
      where: { user_id: req.auth!.userId },
      relations: ['patient'],
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function listEstomiasByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await estomiaRepo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function createEstomia(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, stoma_type, location, sacs_score, sacs_classification,
            stoma_diameter_mm, bag_type, bag_brand, peristomal_skin,
            has_complications, complications_detail, output_characteristics, notes } = req.body;
    if (!patient_id || !stoma_type) throw AppError.badRequest('Paciente e tipo de estomia obrigatórios');

    const ev = estomiaRepo().create({
      patient_id, user_id: req.auth!.userId,
      stoma_type, location, sacs_score, sacs_classification,
      stoma_diameter_mm, bag_type, bag_brand, peristomal_skin,
      has_complications, complications_detail, output_characteristics, notes,
    });
    await estomiaRepo().save(ev);
    res.status(201).json({ status: 'ok', data: ev });
  } catch (err) { next(err); }
}

// ── LASER ────────────────────────────────
const laserRepo = () => AppDataSource.getRepository(LaserSession);

export async function listLaserSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await laserRepo().find({
      where: { user_id: req.auth!.userId },
      relations: ['patient'],
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function listLaserByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await laserRepo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { session_number: 'ASC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function createLaserSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, laser_type, wavelength_nm, power_mw, energy_j, dose_j_cm2,
            time_seconds, points_applied, application_area, indication,
            session_number, total_sessions, photosensitive_meds,
            photosensitive_detail, observations } = req.body;
    if (!patient_id || !laser_type) throw AppError.badRequest('Paciente e tipo de laser obrigatórios');

    const s = laserRepo().create({
      patient_id, user_id: req.auth!.userId,
      laser_type, wavelength_nm, power_mw, energy_j, dose_j_cm2,
      time_seconds, points_applied, application_area, indication,
      session_number, total_sessions, photosensitive_meds,
      photosensitive_detail, observations,
    });
    await laserRepo().save(s);
    res.status(201).json({ status: 'ok', data: s });
  } catch (err) { next(err); }
}

// ── PODIATRIA ────────────────────────────
const podRepo = () => AppDataSource.getRepository(PodiatryEvaluation);

export async function listPodiatry(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await podRepo().find({
      where: { user_id: req.auth!.userId },
      relations: ['patient'],
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function listPodiatryByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await podRepo().find({
      where: { patient_id: req.params.patientId, user_id: req.auth!.userId },
      order: { recorded_at: 'DESC' },
    });
    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}

export async function createPodiatry(req: Request, res: Response, next: NextFunction) {
  try {
    const { patient_id, foot, conditions, nail_assessment, skin_assessment,
            has_diabetes, loss_of_sensitivity, vascular_changes,
            procedure_performed, products_used, recommendations, observations } = req.body;
    if (!patient_id || !foot) throw AppError.badRequest('Paciente e pé obrigatórios');

    const ev = podRepo().create({
      patient_id, user_id: req.auth!.userId,
      foot, conditions, nail_assessment, skin_assessment,
      has_diabetes, loss_of_sensitivity, vascular_changes,
      procedure_performed, products_used, recommendations, observations,
    });
    await podRepo().save(ev);
    res.status(201).json({ status: 'ok', data: ev });
  } catch (err) { next(err); }
}
