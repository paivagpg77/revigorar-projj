import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { User, Patient, WoundAssessment, Evolution, Appointment, Prescription, StockItem, Photo, Document, Institution, Integration, BackupSetting, MonitoringMessage } from '../models';
import { signToken } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const r = <T extends Function>(entity: T) => AppDataSource.getRepository<InstanceType<any>>(entity as any);
const uid = (req: Request) => req.auth!.userId;

function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

function assertUuid(value: string | undefined) { if (!value || !isUuid(value)) throw AppError.badRequest('ID inválido'); }

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function calcAge(bd: Date | string | null): number {
  if (!bd) return 0;
  const d = new Date(bd);
  return Math.floor((Date.now() - d.getTime()) / 31557600000);
}

// ══════════════════════════════════════════════════════
// AUTH — POST /auth/login, /auth/register, GET /auth/me
// ══════════════════════════════════════════════════════
export async function authRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, full_name, email, password, specialization } = req.body;
    const finalName = full_name || name;
    if (!finalName || !email || !password) throw AppError.badRequest('Nome, e-mail e senha obrigatórios');

    const exists = await r(User).findOneBy({ email: email.toLowerCase().trim() });
    if (exists) throw AppError.conflict('E-mail já cadastrado');

    const u = new User();
    u.full_name = finalName.trim();
    u.email = email.toLowerCase().trim();
    u.specialization = specialization?.trim() || null;
    await u.setPassword(password);
    await r(User).save(u);

    // Criar settings padrão para o novo usuário
    await r(Institution).save(r(Institution).create({ user_id: u.id }));
    await r(BackupSetting).save(r(BackupSetting).create({ user_id: u.id }));
    const defaultIntegrations = [
      { name: 'WhatsApp Business API', description: 'Envio de notificações e lembretes por WhatsApp.', enabled: false },
      { name: 'E-mail transacional', description: 'Envio de relatórios e confirmações por e-mail.', enabled: false },
      { name: 'Backup automático na nuvem', description: 'Cópia de segurança diária dos dados do sistema.', enabled: false },
      { name: 'Assinatura digital de documentos', description: 'Assinatura eletrônica de laudos e termos.', enabled: false },
    ];
    for (const ig of defaultIntegrations) {
      await r(Integration).save(r(Integration).create({ ...ig, user_id: u.id }));
    }

    const token = signToken({ userId: u.id, email: u.email });
    res.status(201).json({ token, user: { name: u.full_name, role: u.specialization || '', initials: initials(u.full_name) } });
  } catch (e) { next(e); }
}

export async function authLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw AppError.badRequest('E-mail e senha obrigatórios');
    const u = await r(User).createQueryBuilder('u').addSelect('u.password_hash').where('u.email = :email', { email: email.toLowerCase().trim() }).getOne();
    if (!u || !(await u.checkPassword(password))) throw AppError.unauthorized('Credenciais inválidas');
    u.last_login = new Date(); await r(User).save(u);
    const token = signToken({ userId: u.id, email: u.email });
    res.json({ token, user: { name: u.full_name, role: u.specialization || '', initials: initials(u.full_name) } });
  } catch (e) { next(e); }
}

export async function authMe(req: Request, res: Response, next: NextFunction) {
  try {
    const u = await r(User).findOneBy({ id: uid(req) });
    if (!u) throw AppError.notFound();
    res.json({ name: u.full_name, role: u.specialization || '', initials: initials(u.full_name) });
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// PATIENTS — GET/POST/PUT/DELETE /patients
// ══════════════════════════════════════════════════════
export async function patientsList(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await r(Patient).find({ where: { user_id: uid(req) }, order: { name: 'ASC' } });
    const out = data.map(p => ({
      ...p, age: calcAge(p.birth_date), birthDate: p.birth_date,
      selfResponsible: p.self_responsible, responsibleName: p.responsible_name,
      lastEval: p.last_eval ? new Date(p.last_eval).toLocaleDateString('pt-BR') : null,
    }));
    res.json(out);
  } catch (e) { next(e); }
}

export async function patientGet(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await r(Patient).findOneBy({ id: req.params.id, user_id: uid(req) });
    if (!p) throw AppError.notFound();
    res.json({ ...p, age: calcAge(p.birth_date), selfResponsible: p.self_responsible, responsibleName: p.responsible_name });
  } catch (e) { next(e); }
}

export async function patientCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const p = r(Patient).create({ ...req.body, user_id: uid(req), self_responsible: req.body.selfResponsible, responsible_name: req.body.responsibleName });
    await r(Patient).save(p);
    res.status(201).json({ ...p, age: calcAge(p.birth_date) });
  } catch (e) { next(e); }
}

export async function patientUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await r(Patient).findOneBy({ id: req.params.id, user_id: uid(req) });
    if (!p) throw AppError.notFound();
    Object.assign(p, req.body);
    if (req.body.selfResponsible !== undefined) p.self_responsible = req.body.selfResponsible;
    if (req.body.responsibleName !== undefined) p.responsible_name = req.body.responsibleName;
    await r(Patient).save(p);
    res.json(p);
  } catch (e) { next(e); }
}

export async function patientDelete(req: Request, res: Response, next: NextFunction) {
  try {
    await r(Patient).delete({ id: req.params.id, user_id: uid(req) });
    res.status(204).send();
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// DASHBOARD — GET /dashboard/stats, /upcoming, /weekly-series, /distribution
// ══════════════════════════════════════════════════════
export async function dashStats(req: Request, res: Response, next: NextFunction) {
  try {
    const u = uid(req);
    const patients = await r(Patient).count({ where: { user_id: u, status: 'Ativo' } });
    const evalsToday = await r(Evolution).createQueryBuilder('e').where('e.user_id = :u AND DATE(e.created_at) = CURRENT_DATE', { u }).getCount();
    const pendencias = await r(Appointment).count({ where: { user_id: u, status: 'Pendente' } });
    res.json({ patients, evaluationsToday: evalsToday, evolutionsToday: evalsToday, pendencias });
  } catch (e) { next(e); }
}

export async function dashUpcoming(req: Request, res: Response, next: NextFunction) {
  try {
    const appts = await r(Appointment).find({ where: { user_id: uid(req) }, relations: ['patient'], order: { day_of_week: 'ASC', time: 'ASC' }, take: 5 });
    res.json(appts.map(a => ({ id: a.id, patient_id: a.patient_id, name: a.patient?.name || '', detail: `${a.type} | ${a.time}`, status: a.status })));
  } catch (e) { next(e); }
}

export async function dashWeekly(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = await r(Evolution).createQueryBuilder('e')
      .select("EXTRACT(DOW FROM e.created_at)", 'dow').addSelect('COUNT(*)', 'c')
      .where('e.user_id = :u AND e.created_at >= NOW() - INTERVAL \'7 days\'', { u: uid(req) })
      .groupBy('dow').orderBy('dow').getRawMany();
    const series = [0, 0, 0, 0, 0, 0, 0];
    raw.forEach((r: any) => { series[((parseInt(r.dow) + 6) % 7)] = parseInt(r.c); });
    res.json(series);
  } catch (e) { next(e); }
}

export async function dashDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = await r(Patient).createQueryBuilder('p')
      .select('p.type', 'label').addSelect('COUNT(*)', 'value')
      .where('p.user_id = :u', { u: uid(req) }).groupBy('p.type').getRawMany();
    const total = raw.reduce((s: number, x: any) => s + parseInt(x.value), 0) || 1;
    const colors: Record<string, string> = { 'Ferida': 'var(--color-primary)', 'Estomia': 'var(--color-primary-light)' };
    res.json(raw.map((x: any) => ({ label: x.label || 'Outros', value: Math.round((parseInt(x.value) / total) * 100), color: colors[x.label] || 'var(--color-accent-soft)' })));
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// AGENDA — GET/POST/PATCH/DELETE /agenda
// ══════════════════════════════════════════════════════
export async function agendaGet(req: Request, res: Response, next: NextFunction) {
  try {
    const appts = await r(Appointment).find({ where: { user_id: uid(req) }, relations: ['patient'], order: { time: 'ASC' } });
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const schedule = days.map((label, i) => {
      const items = appts.filter(a => a.day_of_week === i).map(a => ({
        id: a.id, name: a.patient?.name || '', type: a.type, time: a.time, status: a.status,
      }));
      return { label, count: items.length, appointments: items };
    });
    res.json(schedule);
  } catch (e) { next(e); }
}

export async function agendaCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const dayParam = parseInt(req.params.day);
    const { patient_id, type, time, status } = req.body;
    assertUuid(patient_id);
    const patient = await r(Patient).findOneBy({ id: patient_id, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    if (dayParam < 0 || dayParam > 6) throw AppError.badRequest('Dia inválido');
    if (!time) throw AppError.badRequest('Horário obrigatório');
    const a = r(Appointment).create({ user_id: uid(req), patient_id, day_of_week: dayParam, time, type: type || patient.type || 'Ferida', status: status || 'Confirmado' });
    await r(Appointment).save(a);
    res.status(201).json({ id: a.id, patient_id: a.patient_id, name: patient.name, type: a.type, time: a.time, status: a.status });
  } catch (e) { next(e); }
}

export async function agendaUpdateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await r(Appointment).findOneBy({ id: req.params.id, user_id: uid(req) });
    if (!a) throw AppError.notFound();
    a.status = req.body.status; await r(Appointment).save(a);
    res.json({ id: a.id, status: a.status });
  } catch (e) { next(e); }
}

export async function agendaDelete(req: Request, res: Response, next: NextFunction) {
  try {
    await r(Appointment).delete({ id: req.params.id, user_id: uid(req) });
    res.status(204).send();
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// ASSESSMENTS — GET /assessments, GET/PUT /patients/:id/wound-assessment
// ══════════════════════════════════════════════════════
export async function assessmentsList(req: Request, res: Response, next: NextFunction) {
  try {
    const patients = await r(Patient).find({ where: { user_id: uid(req) }, order: { last_eval: 'DESC' } });
    res.json(patients.map(p => ({
      id: p.id, name: p.name, age: calcAge(p.birth_date), initials: initials(p.name),
      type: p.type || 'Ferida', status: p.status, location: '', lastEval: p.last_eval ? new Date(p.last_eval).toLocaleDateString('pt-BR') : null,
    })));
  } catch (e) { next(e); }
}

export async function assessmentGet(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const wa = await r(WoundAssessment).findOneBy({ patient_id: req.params.patientId, user_id: uid(req) });
    res.json(wa || { identification: {}, characteristics: {}, care_plan: {} });
  } catch (e) { next(e); }
}

export async function assessmentUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    let wa = await r(WoundAssessment).findOneBy({ patient_id: req.params.patientId, user_id: uid(req) });
    if (!wa) wa = r(WoundAssessment).create({ patient_id: req.params.patientId, user_id: uid(req) });
    const section = req.params.section as 'identification' | 'characteristics' | 'care_plan';
    (wa as any)[section] = req.body;
    await r(WoundAssessment).save(wa);
    // Atualizar last_eval do paciente
    await r(Patient).update({ id: patient.id, user_id: uid(req) }, { last_eval: new Date() as any });
    res.json(wa);
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// EVOLUTIONS — GET /evolutions/feed, GET /patients/:id/records, /evolution-timeline
// ══════════════════════════════════════════════════════
export async function evolutionsFeed(req: Request, res: Response, next: NextFunction) {
  try {
    const evos = await r(Evolution).find({ where: { user_id: uid(req) }, relations: ['patient'], order: { created_at: 'DESC' }, take: 30 });
    res.json(evos.map(e => ({
      id: e.id, patient_id: e.patient_id, name: e.patient?.name || '', initials: initials(e.patient?.name || 'XX'),
      date: new Date(e.created_at).toLocaleDateString('pt-BR'), type: e.type,
      description: e.description, hasPhoto: e.has_photo,
    })));
  } catch (e) { next(e); }
}

export async function patientRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const evos = await r(Evolution).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { created_at: 'DESC' } });
    res.json(evos.map(e => ({ date: new Date(e.created_at).toLocaleDateString('pt-BR'), type: e.type, professional: e.professional, description: e.description })));
  } catch (e) { next(e); }
}

export async function patientTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const evos = await r(Evolution).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { created_at: 'ASC' } });
    res.json(evos);
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// PRESCRIPTIONS — CRUD + board
// ══════════════════════════════════════════════════════
export async function prescriptionBoard(req: Request, res: Response, next: NextFunction) {
  try {
    const all = await r(Prescription).find({ where: { user_id: uid(req) }, relations: ['patient'], order: { created_at: 'DESC' } });
    const format = (p: Prescription) => ({ id: p.id, name: p.patient?.name || '', initials: initials(p.patient?.name || 'XX'), category: p.category, description: p.description, status: p.status });
    res.json({ active: all.filter(p => p.status === 'active').map(format), completed: all.filter(p => p.status === 'completed').map(format) });
  } catch (e) { next(e); }
}

export async function prescriptionsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const all = await r(Prescription).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { created_at: 'DESC' } });
    res.json(all);
  } catch (e) { next(e); }
}

export async function prescriptionCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const patientId = req.params.patientId || req.body.patient_id;
    assertUuid(patientId);
    const patient = await r(Patient).findOneBy({ id: patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const p = r(Prescription).create({ ...req.body, patient_id: patientId, user_id: uid(req) });
    await r(Prescription).save(p);
    res.status(201).json(p);
  } catch (e) { next(e); }
}

export async function prescriptionUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await r(Prescription).findOneBy({ id: req.params.id, user_id: uid(req) });
    if (!p) throw AppError.notFound();
    Object.assign(p, req.body); await r(Prescription).save(p);
    res.json(p);
  } catch (e) { next(e); }
}

export async function prescriptionDelete(req: Request, res: Response, next: NextFunction) {
  try { await r(Prescription).delete({ id: req.params.id, user_id: uid(req) }); res.status(204).send(); } catch (e) { next(e); }
}

export async function dressingCatalog(_req: Request, res: Response) {
  res.json([
    { name: 'Hidrogel', indication: 'Feridas com tecido necrótico ou esfacelo, pouco exsudativas.', frequency: 'Troca a cada 24–72h' },
    { name: 'Espuma de poliuretano', indication: 'Feridas com exsudato moderado a intenso.', frequency: 'Troca a cada 3–7 dias' },
    { name: 'Alginato de cálcio', indication: 'Feridas altamente exsudativas ou com sangramento leve.', frequency: 'Troca a cada 1–3 dias' },
    { name: 'Filme transparente', indication: 'Proteção de pele íntegra ou feridas superficiais.', frequency: 'Troca a cada 5–7 dias' },
    { name: 'Carvão ativado com prata', indication: 'Feridas com odor e sinais de infecção.', frequency: 'Troca a cada 2–3 dias' },
  ]);
}

// ══════════════════════════════════════════════════════
// STOCK — GET/POST/PATCH/DELETE /stock
// ══════════════════════════════════════════════════════
export async function stockList(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await r(StockItem).find({ where: { user_id: uid(req) }, order: { name: 'ASC' } });
    res.json(items.map(i => ({ ...i, status: Number(i.quantity) <= Number(i.min_quantity) ? 'Estoque baixo' : 'Em estoque' })));
  } catch (e) { next(e); }
}

export async function stockCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const item = r(StockItem).create({ ...req.body, user_id: uid(req) });
    await r(StockItem).save(item);
    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function stockUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await r(StockItem).findOneBy({ id: req.params.id, user_id: uid(req) });
    if (!item) throw AppError.notFound();
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    await r(StockItem).save(item);
    res.json({ ...item, status: Number(item.quantity) <= Number(item.min_quantity) ? 'Estoque baixo' : 'Em estoque' });
  } catch (e) { next(e); }
}

export async function stockDelete(req: Request, res: Response, next: NextFunction) {
  try { await r(StockItem).delete({ id: req.params.id, user_id: uid(req) }); res.status(204).send(); } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// PHOTOS — GET /photos, GET/POST /patients/:id/photos
// ══════════════════════════════════════════════════════
const uploadDir = path.resolve(env.upload.dir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
export const uploadMiddleware = multer({
  storage: multer.diskStorage({ destination: (_r, _f, cb) => cb(null, uploadDir), filename: (_r, f, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(f.originalname).toLowerCase()}`) }),
  limits: { fileSize: env.upload.maxFileSize },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype)),
});

function publicPhotoUrl(req: Request, filePath: string | null | undefined) {
  if (!filePath) return null;
  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${req.protocol}://${req.get('host')}${normalized}`;
}

export async function photosAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = uid(req);
    const patients = await r(Patient).find({
      where: { user_id: userId },
      order: { name: 'ASC' },
    });

    const out = [];

    for (const p of patients) {
      const last = await r(Photo).findOne({
        where: { patient_id: p.id, user_id: userId },
        order: { created_at: 'DESC' },
      });

      const count = await r(Photo).count({
        where: { patient_id: p.id, user_id: userId },
      });

      out.push({
        id: p.id,
        name: p.name,
        initials: initials(p.name),
        photoCount: count,
        lastPhoto: last?.created_at || null,
        thumbnail: publicPhotoUrl(req, last?.file_path),
      });
    }

    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function photosByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);

    const userId = uid(req);

    const patient = await r(Patient).findOneBy({
      id: req.params.patientId,
      user_id: userId,
    });

    if (!patient) {
      throw AppError.notFound('Paciente não encontrado');
    }

    const photos = await r(Photo).find({
      where: {
        patient_id: req.params.patientId,
        user_id: userId,
      },
      order: { created_at: 'DESC' },
    });

    res.json(photos.map((p) => ({
      id: p.id,
      url: publicPhotoUrl(req, p.file_path),
      file_path: p.file_path,
      date: p.created_at,
      created_at: p.created_at,
      file_size: p.file_size,
    })));
  } catch (e) {
    next(e);
  }
}

export async function photoUpload(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);

    if (!req.file) {
      throw AppError.badRequest('Nenhuma imagem válida foi enviada');
    }

    const userId = uid(req);

    const patient = await r(Patient).findOneBy({
      id: req.params.patientId,
      user_id: userId,
    });

    if (!patient) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}

      throw AppError.notFound('Paciente não encontrado');
    }

    const filePath = `/uploads/${req.file.filename}`;

    const photo = r(Photo).create({
      patient_id: patient.id,
      user_id: userId,
      file_path: filePath,
      file_size: req.file.size,
    });

    await r(Photo).save(photo);

    res.status(201).json({
      id: photo.id,
      patient_id: photo.patient_id,
      user_id: photo.user_id,
      url: publicPhotoUrl(req, photo.file_path),
      file_path: photo.file_path,
      date: photo.created_at,
      created_at: photo.created_at,
      file_size: photo.file_size,
    });
  } catch (e) {
    next(e);
  }
}

// ══════════════════════════════════════════════════════
// DOCUMENTS — GET/POST /patients/:id/documents
// ══════════════════════════════════════════════════════
export async function documentsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const docs = await r(Document).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { date: 'DESC' } });
    res.json(docs.map(d => ({ name: d.name, date: new Date(d.date).toLocaleDateString('pt-BR'), size: d.size || '' })));
  } catch (e) { next(e); }
}

export async function documentCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = r(Document).create({ ...req.body, patient_id: req.params.patientId, user_id: uid(req) });
    await r(Document).save(doc);
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// MONITORING — GET/POST /patients/:id/monitoring/*
// ══════════════════════════════════════════════════════
export async function monitoringMessages(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const msgs = await r(MonitoringMessage).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { created_at: 'ASC' } });
    res.json(msgs.map(m => ({ id: m.id, sender: m.sender, text: m.text, timestamp: m.created_at })));
  } catch (e) { next(e); }
}

export async function monitoringSend(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const msg = r(MonitoringMessage).create({ patient_id: req.params.patientId, user_id: uid(req), sender: 'professional', text: req.body.text });
    await r(MonitoringMessage).save(msg);
    res.status(201).json({ id: msg.id, sender: msg.sender, text: msg.text, timestamp: msg.created_at });
  } catch (e) { next(e); }
}

export async function monitoringRequestPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    assertUuid(req.params.patientId);
    const patient = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    if (!patient) throw AppError.notFound('Paciente não encontrado');
    const msg = r(MonitoringMessage).create({ patient_id: req.params.patientId, user_id: uid(req), sender: 'professional', text: 'Solicitação de foto enviada ao paciente.' });
    await r(MonitoringMessage).save(msg);
    res.status(201).json({ id: msg.id, sender: msg.sender, text: msg.text, timestamp: msg.created_at });
  } catch (e) { next(e); }
}

export async function monitoringStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await r(Patient).findOneBy({ id: req.params.patientId, user_id: uid(req) });
    res.json({ patientName: p?.name || '', status: 'online', lastSeen: new Date() });
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// REPORTS — GET /reports, /reports/weekdays, /reports/distribution
// ══════════════════════════════════════════════════════
export async function reportsList(req: Request, res: Response, next: NextFunction) {
  try {
    const u = uid(req);
    const [patients, evals] = await Promise.all([
      r(Patient).count({ where: { user_id: u } }),
      r(Evolution).count({ where: { user_id: u } }),
    ]);
    res.json([
      { label: 'Perfil dos pacientes', value: patients, type: 'link' },
      { label: 'Evolução das feridas', value: evals, type: 'link' },
      { label: 'Evolução das estomias', value: 0, type: 'link' },
      { label: 'Uso de coberturas', value: 0, type: 'link' },
      { label: 'Indicadores clínicos', value: 0, type: 'link' },
    ]);
  } catch (e) { next(e); }
}

export async function reportsWeekdays(req: Request, res: Response) { res.json(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']); }
export async function reportsDistribution(req: Request, res: Response, next: NextFunction) { return dashDistribution(req, res, next); }

// ══════════════════════════════════════════════════════
// SETTINGS — institution, users, integrations, security, backup
// ══════════════════════════════════════════════════════
export async function settingsGet(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await r(Institution).findOneBy({ user_id: uid(req) });
    if (!inst) { inst = r(Institution).create({ user_id: uid(req) }); await r(Institution).save(inst); }
    res.json(inst);
  } catch (e) { next(e); }
}

export async function settingsUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    let inst = await r(Institution).findOneBy({ user_id: uid(req) });
    if (!inst) inst = r(Institution).create({ user_id: uid(req) });
    Object.assign(inst, req.body); await r(Institution).save(inst);
    res.json(inst);
  } catch (e) { next(e); }
}

export async function usersList(req: Request, res: Response, next: NextFunction) {
  try {
    const u = await r(User).findOneBy({ id: uid(req) });
    res.json([{ id: u?.id, name: u?.full_name, email: u?.email, role: u?.specialization || '', status: 'Ativo' }]);
  } catch (e) { next(e); }
}

export async function usersCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !password) throw AppError.badRequest('Nome, e-mail e senha são obrigatórios');
    const emailNorm = String(email).toLowerCase().trim();
    if (await r(User).findOneBy({ email: emailNorm })) throw AppError.conflict('E-mail já cadastrado');
    const user = new User();
    user.full_name = String(name).trim();
    user.email = emailNorm;
    user.specialization = role?.trim() || null;
    await user.setPassword(password);
    await r(User).save(user);
    res.status(201).json({ id: user.id, name: user.full_name, email: user.email, role: user.specialization || '', status: 'Ativo' });
  } catch (e) { next(e); }
}
export async function usersUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await r(User).findOneBy({ id: req.params.id });
    if (!user) throw AppError.notFound('Usuário não encontrado');
    if (req.body.name !== undefined) user.full_name = req.body.name;
    if (req.body.email !== undefined) user.email = String(req.body.email).toLowerCase().trim();
    if (req.body.role !== undefined) user.specialization = req.body.role || null;
    if (req.body.password) await user.setPassword(req.body.password);
    await r(User).save(user);
    res.json({ id: user.id, name: user.full_name, email: user.email, role: user.specialization || '', status: user.is_active ? 'Ativo' : 'Inativo' });
  } catch (e) { next(e); }
}
export async function usersDelete(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.params.id === uid(req)) throw AppError.badRequest('A conta atual não pode ser removida por esta tela');
    await r(User).delete({ id: req.params.id });
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function integrationsGet(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await r(Integration).find({ where: { user_id: uid(req) } });
    res.json(data);
  } catch (e) { next(e); }
}

export async function integrationsToggle(req: Request, res: Response, next: NextFunction) {
  try {
    const name = decodeURIComponent(req.params.name);
    const ig = await r(Integration).findOneBy({ user_id: uid(req), name });
    if (!ig) throw AppError.notFound();
    ig.enabled = req.body.enabled; await r(Integration).save(ig);
    res.json({ name: ig.name, enabled: ig.enabled });
  } catch (e) { next(e); }
}

export async function securityUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await r(User).createQueryBuilder('u').addSelect('u.password_hash').where('u.id = :id', { id: uid(req) }).getOne();
    if (!user) throw AppError.notFound('Usuário não encontrado');
    if (req.body.newPassword) {
      if (!req.body.currentPassword || !(await user.checkPassword(req.body.currentPassword))) throw AppError.unauthorized('Senha atual inválida');
      if (String(req.body.newPassword).length < 6) throw AppError.badRequest('A nova senha deve ter pelo menos 6 caracteres');
      await user.setPassword(req.body.newPassword);
      await r(User).save(user);
    }
    res.json({ message: 'Configurações de segurança atualizadas' });
  } catch (e) { next(e); }
}

export async function backupGet(req: Request, res: Response, next: NextFunction) {
  try {
    let b = await r(BackupSetting).findOneBy({ user_id: uid(req) });
    if (!b) { b = r(BackupSetting).create({ user_id: uid(req) }); await r(BackupSetting).save(b); }
    res.json({ frequency: b.frequency, lastBackup: b.last_backup, totalBackups: b.total_backups });
  } catch (e) { next(e); }
}

export async function backupRun(req: Request, res: Response, next: NextFunction) {
  try {
    const b = await r(BackupSetting).findOneBy({ user_id: uid(req) });
    if (b) { b.last_backup = new Date(); b.total_backups++; await r(BackupSetting).save(b); }
    res.json({ message: 'Backup realizado', lastBackup: new Date() });
  } catch (e) { next(e); }
}

export async function backupFrequency(req: Request, res: Response, next: NextFunction) {
  try {
    const b = await r(BackupSetting).findOneBy({ user_id: uid(req) });
    if (b) { b.frequency = req.body.frequency; await r(BackupSetting).save(b); }
    res.json({ frequency: req.body.frequency });
  } catch (e) { next(e); }
}