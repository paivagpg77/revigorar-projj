import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { Patient } from '../models/Patient';
import { Wound } from '../models/Wound';
import { Evaluation } from '../models/Evaluation';
import { Appointment } from '../models/Appointment';
import { FinancialRecord } from '../models/FinancialRecord';
import { StockItem } from '../models/StockItem';

// ── DASHBOARD ────────────────────────────
export async function dashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.auth!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalWounds, evalsToday, pendencias] = await Promise.all([
      AppDataSource.getRepository(Patient).count({ where: { user_id: uid, status: 'active' } }),
      AppDataSource.getRepository(Wound).count({ where: { user_id: uid, status: 'active' } }),
      AppDataSource.getRepository(Evaluation)
        .createQueryBuilder('e')
        .where('e.user_id = :uid AND e.created_at >= :today AND e.created_at < :tomorrow', { uid, today, tomorrow })
        .getCount(),
      AppDataSource.getRepository(Appointment)
        .createQueryBuilder('a')
        .where('a.user_id = :uid AND a.status IN (:...s)', { uid, s: ['scheduled', 'confirmed'] })
        .andWhere('a.scheduled_at >= :today', { today })
        .getCount(),
    ]);

    // Evolução semanal (atendimentos por dia últimos 7 dias)
    const weeklyRaw = await AppDataSource.getRepository(Evaluation)
      .createQueryBuilder('e')
      .select("DATE(e.created_at)", 'day')
      .addSelect("COUNT(*)", 'count')
      .where('e.user_id = :uid AND e.created_at >= NOW() - INTERVAL \'7 days\'', { uid })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    const weekly = weeklyRaw.map((r: any) => ({ day: r.day, count: parseInt(r.count) }));

    // Distribuição por tipo
    const woundsByEtiology = await AppDataSource.getRepository(Wound)
      .createQueryBuilder('w')
      .select('w.etiology', 'etiology')
      .addSelect('COUNT(*)', 'count')
      .where('w.user_id = :uid AND w.status = :s', { uid, s: 'active' })
      .groupBy('w.etiology')
      .getRawMany();

    // Próximos atendimentos
    const nextAppointments = await AppDataSource.getRepository(Appointment).find({
      where: { user_id: uid },
      relations: ['patient'],
      order: { scheduled_at: 'ASC' },
      take: 5,
    });

    // Alertas de estoque
    const stockAlerts = await AppDataSource.getRepository(StockItem)
      .createQueryBuilder('s')
      .where('s.user_id = :uid AND s.is_active = true', { uid })
      .andWhere('(s.quantity <= s.min_quantity OR s.expiry_date <= CURRENT_DATE + INTERVAL \'30 days\')')
      .getCount();

    res.json({
      status: 'ok',
      data: {
        patients: totalPatients,
        evaluations_today: evalsToday,
        evolutions_today: evalsToday,
        pendencias,
        weekly,
        wounds_by_etiology: woundsByEtiology,
        next_appointments: nextAppointments,
        stock_alerts: stockAlerts,
      },
    });
  } catch (err) { next(err); }
}

// ── EVOLUÇÕES FEED ───────────────────────
export async function evolutionsFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.auth!.userId;
    const { type, page = '1', limit = '20' } = req.query;
    const pg = Math.max(1, parseInt(page as string));
    const lm = Math.min(50, parseInt(limit as string));

    const qb = AppDataSource.getRepository(Evaluation)
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.wound', 'w')
      .leftJoin('w.patient', 'p')
      .addSelect(['p.id', 'p.name'])
      .leftJoinAndSelect('e.photos', 'ph')
      .where('e.user_id = :uid', { uid })
      .orderBy('e.recorded_at', 'DESC')
      .skip((pg - 1) * lm)
      .take(lm);

    const [data, total] = await qb.getManyAndCount();

    const feed = data.map(e => ({
      id: e.id,
      patient_name: (e.wound as any)?.patient?.name || 'Paciente',
      patient_initials: ((e.wound as any)?.patient?.name || 'PP').split(' ').map((n: string) => n[0]).join('').slice(0, 2),
      description: e.description,
      has_photos: e.photos && e.photos.length > 0,
      photos_count: e.photos?.length || 0,
      recorded_at: e.recorded_at,
      wound_location: e.wound?.location,
      wound_etiology: e.wound?.etiology,
    }));

    res.json({ status: 'ok', data: feed, meta: { total, page: pg, limit: lm } });
  } catch (err) { next(err); }
}

// ── RELATÓRIOS ───────────────────────────
export async function reports(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.auth!.userId;

    // Evolução de feridas (semanal)
    const woundEvolution = await AppDataSource.getRepository(Evaluation)
      .createQueryBuilder('e')
      .select("DATE(e.created_at)", 'day')
      .addSelect("COUNT(*)", 'count')
      .where('e.user_id = :uid AND e.created_at >= NOW() - INTERVAL \'7 days\'', { uid })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany();

    // Tipos de atendimento
    const typeDistribution = await AppDataSource.getRepository(Wound)
      .createQueryBuilder('w')
      .select('w.etiology', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('w.user_id = :uid', { uid })
      .groupBy('w.etiology')
      .getRawMany();

    // Totais gerais
    const [totalPatients, totalWounds, totalEvals, healedWounds] = await Promise.all([
      AppDataSource.getRepository(Patient).count({ where: { user_id: uid } }),
      AppDataSource.getRepository(Wound).count({ where: { user_id: uid } }),
      AppDataSource.getRepository(Evaluation).count({ where: { user_id: uid } }),
      AppDataSource.getRepository(Wound).count({ where: { user_id: uid, status: 'healed' } }),
    ]);

    const healingRate = totalWounds > 0 ? Math.round((healedWounds / totalWounds) * 100) : 0;

    res.json({
      status: 'ok',
      data: {
        wound_evolution: woundEvolution,
        type_distribution: typeDistribution,
        totals: { patients: totalPatients, wounds: totalWounds, evaluations: totalEvals, healed: healedWounds },
        healing_rate: healingRate,
      },
    });
  } catch (err) { next(err); }
}

// ── FOTOS POR PACIENTE ───────────────────
export async function photosByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const uid = req.auth!.userId;

    const patients = await AppDataSource.getRepository(Patient)
      .createQueryBuilder('p')
      .leftJoin('p.wounds', 'w')
      .leftJoin('w.evaluations', 'e')
      .leftJoin('e.photos', 'ph')
      .select(['p.id', 'p.name'])
      .addSelect('COUNT(ph.id)', 'photo_count')
      .addSelect('MAX(ph.created_at)', 'last_photo')
      .where('p.user_id = :uid', { uid })
      .groupBy('p.id')
      .orderBy('last_photo', 'DESC', 'NULLS LAST')
      .getRawMany();

    const data = patients.map((r: any) => ({
      id: r.p_id,
      name: r.p_name,
      initials: r.p_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
      photo_count: parseInt(r.photo_count),
      last_photo: r.last_photo,
    }));

    res.json({ status: 'ok', data });
  } catch (err) { next(err); }
}
