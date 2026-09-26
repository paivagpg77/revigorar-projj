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
    const { name, full_name, email, password } = req.body;
    const finalName = full_name || name;
    if (!finalName || !email || !password) throw AppError.badRequest('Nome, e-mail e senha obrigatórios');

    const exists = await r(User).findOneBy({ email: email.toLowerCase().trim() });
    if (exists) throw AppError.conflict('E-mail já cadastrado');

    const u = new User();
    u.full_name = finalName;
    u.email = email.toLowerCase().trim();
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
    res.status(201).json({ token, user: { name: u.full_name, role: u.specialization || 'Enfermeira', initials: initials(u.full_name) } });
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
    res.json({ token, user: { name: u.full_name, role: u.specialization || 'Enfermeira', initials: initials(u.full_name) } });
  } catch (e) { next(e); }
}

export async function authMe(req: Request, res: Response, next: NextFunction) {
  try {
    const u = await r(User).findOneBy({ id: uid(req) });
    if (!u) throw AppError.notFound();
    res.json({ name: u.full_name, role: u.specialization || 'Enfermeira', initials: initials(u.full_name) });
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
    res.json(appts.map(a => ({ name: a.patient?.name || '', detail: `${a.type} | ${a.time}`, status: a.status })));
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
    const { patient_id, name, type, time, status } = req.body;
    let pid = patient_id;
    // Se não tem patient_id mas tem nome, busca ou cria
    if (!pid && name) {
      let pat = await r(Patient).findOneBy({ name, user_id: uid(req) });
      if (!pat) { pat = r(Patient).create({ name, user_id: uid(req), type: type || 'Ferida' }); await r(Patient).save(pat); }
      pid = pat.id;
    }
    const a = r(Appointment).create({ user_id: uid(req), patient_id: pid, day_of_week: dayParam, time, type: type || 'Ferida', status: status || 'Confirmado' });
    await r(Appointment).save(a);
    res.status(201).json({ id: a.id, name: req.body.name, type: a.type, time: a.time, status: a.status });
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
    const wa = await r(WoundAssessment).findOneBy({ patient_id: req.params.patientId, user_id: uid(req) });
    res.json(wa || { identification: {}, characteristics: {}, care_plan: {} });
  } catch (e) { next(e); }
}

export async function assessmentUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    let wa = await r(WoundAssessment).findOneBy({ patient_id: req.params.patientId, user_id: uid(req) });
    if (!wa) wa = r(WoundAssessment).create({ patient_id: req.params.patientId, user_id: uid(req) });
    const section = req.params.section as 'identification' | 'characteristics' | 'care_plan';
    (wa as any)[section] = req.body;
    await r(WoundAssessment).save(wa);
    // Atualizar last_eval do paciente
    await r(Patient).update({ id: req.params.patientId }, { last_eval: new Date() as any });
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
      id: e.id, name: e.patient?.name || '', initials: initials(e.patient?.name || 'XX'),
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
    const all = await r(Prescription).find({ where: { patient_id: req.params.patientId, user_id: uid(req) }, order: { created_at: 'DESC' } });
    res.json(all);
  } catch (e) { next(e); }
}

export async function prescriptionCreate(req: Request, res: Response, next: NextFunction) {
  try {
    const p = r(Prescription).create({ ...req.body, user_id: uid(req) });
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
export const uploadMiddleware = multer({ storage: multer.diskStorage({ destination: (_r, _f, cb) => cb(null, uploadDir), filename: (_r, f, cb) => cb(null, Date.now() + path.extname(f.originalname)) }), limits: { fileSize: env.upload.maxFileSize } });

export async function photosAll(req: Request, res: Response, next: NextFunction) {
  try {
    const patients = await r(Patient).find({ where: { user_id: uid(req) }, order: { name: 'ASC' } });
    const out = [];
    for (const p of patients) {
      const count = await r(Photo).count({ where: { patient_id: p.id } });
      const last = await r(Photo).findOne({ where: { patient_id: p.id }, order: { created_at: 'DESC' } });
      out.push({ id: p.id, name: p.name, initials: initials(p.name), photoCount: count, lastPhoto: last?.created_at || null, thumbnail: last?.file_path || null });
    }
    res.json(out);
  } catch (e) { next(e); }
}

export async function photosByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const photos = await r(Photo).find({ where: { patient_id: req.params.patientId }, order: { created_at: 'DESC' } });
    res.json(photos.map(p => ({ id: p.id, url: p.file_path, date: p.created_at })));
  } catch (e) { next(e); }
}

export async function photoUpload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw AppError.badRequest('Nenhum arquivo');
    const photo = r(Photo).create({ patient_id: req.params.patientId, user_id: uid(req), file_path: `/uploads/${req.file.filename}`, file_size: req.file.size });
    await r(Photo).save(photo);
    res.status(201).json(photo);
  } catch (e) { next(e); }
}

// ══════════════════════════════════════════════════════
// DOCUMENTS — GET/POST /patients/:id/documents
// ══════════════════════════════════════════════════════
export async function documentsByPatient(req: Request, res: Response, next: NextFunction) {
  try {
    const docs = await r(Document).find({ where: { patient_id: req.params.patientId }, order: { date: 'DESC' } });
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
    const msgs = await r(MonitoringMessage).find({ where: { patient_id: req.params.patientId }, order: { created_at: 'ASC' } });
    res.json(msgs.map(m => ({ id: m.id, sender: m.sender, text: m.text, timestamp: m.created_at })));
  } catch (e) { next(e); }
}

export async function monitoringSend(req: Request, res: Response, next: NextFunction) {
  try {
    const msg = r(MonitoringMessage).create({ patient_id: req.params.patientId, user_id: uid(req), sender: 'professional', text: req.body.text });
    await r(MonitoringMessage).save(msg);
    res.status(201).json({ id: msg.id, sender: msg.sender, text: msg.text, timestamp: msg.created_at });
  } catch (e) { next(e); }
}

export async function monitoringRequestPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const msg = r(MonitoringMessage).create({ patient_id: req.params.patientId, user_id: uid(req), sender: 'professional', text: '📸 Solicitação de foto enviada ao paciente.' });
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
    res.json([{ id: u?.id, name: u?.full_name, email: u?.email, role: u?.specialization || 'Enfermeira', status: 'Ativo' }]);
  } catch (e) { next(e); }
}

export async function usersCreate(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ id: Date.now().toString(), status: 'Ativo', ...req.body }); } catch (e) { next(e); }
}
export async function usersUpdate(req: Request, res: Response, next: NextFunction) {
  try { res.json({ id: req.params.id, ...req.body }); } catch (e) { next(e); }
}
export async function usersDelete(req: Request, res: Response, next: NextFunction) {
  try { res.status(204).send(); } catch (e) { next(e); }
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

export async function securityUpdate(req: Request, res: Response) { res.json(req.body); }

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
