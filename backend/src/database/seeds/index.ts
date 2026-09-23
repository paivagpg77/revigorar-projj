import 'reflect-metadata';
import { AppDataSource } from '../../config/database';
import { User } from '../../models/User';
import { Patient } from '../../models/Patient';
import { Wound } from '../../models/Wound';
import { Evaluation } from '../../models/Evaluation';
import { Appointment } from '../../models/Appointment';
import { FinancialRecord } from '../../models/FinancialRecord';
import { StockItem } from '../../models/StockItem';
import { StockMovement } from '../../models/StockMovement';
import { EstomiaEvaluation } from '../../models/EstomiaEvaluation';
import { LaserSession } from '../../models/LaserSession';
import { PodiatryEvaluation } from '../../models/PodiatryEvaluation';
import logger from '../../utils/logger';

async function seed() {
  await AppDataSource.initialize();
  logger.info('Populando banco com dados de demonstração...');

  const userRepo = AppDataSource.getRepository(User);

  // Buscar ou criar usuário
  let user = await userRepo.findOneBy({ email: 'ana@revigorar.com' });
  if (!user) {
    user = new User();
    user.full_name = 'Dra. Ana Silva';
    user.email = 'ana@revigorar.com';
    user.professional_license = 'COREN-CE 123456';
    user.specialization = 'Estomaterapia';
    await user.setPassword('Senha@123');
    await userRepo.save(user);
  }
  const uid = user.id;

  // ── PACIENTES ──────────────────────────
  const patRepo = AppDataSource.getRepository(Patient);
  const patientsData = [
    { name: 'Maria Santos Silva', birth_date: '1959-03-15', gender: 'F', phone: '85988887777', comorbidities: 'Diabetes tipo 2, Hipertensão', medications: 'Metformina 850mg, Losartana 50mg' },
    { name: 'João Pedro Oliveira', birth_date: '1952-08-22', gender: 'M', phone: '85977776666', comorbidities: 'Insuficiência venosa crônica', medications: 'Diosmina 500mg' },
    { name: 'Teresa Lima Costa', birth_date: '1980-11-10', gender: 'F', phone: '85966665555', comorbidities: 'Nenhuma', medications: '' },
    { name: 'Carlos Eduardo Souza', birth_date: '1965-04-30', gender: 'M', phone: '85955554444', comorbidities: 'Diabetes tipo 2, Neuropatia periférica', medications: 'Insulina NPH, Gabapentina' },
    { name: 'Ana Paula Ferreira', birth_date: '1973-07-18', gender: 'F', phone: '85944443333', comorbidities: 'Doença de Crohn', medications: 'Mesalazina 800mg' },
    { name: 'Francisco Rodrigues', birth_date: '1948-01-25', gender: 'M', phone: '85933332222', comorbidities: 'DPOC, Hipertensão', medications: 'Enalapril 20mg' },
    { name: 'Lúcia Mendes Braga', birth_date: '1970-09-05', gender: 'F', phone: '85922221111', comorbidities: 'Artrite reumatoide', medications: 'Metotrexato' },
  ];

  const patients: Patient[] = [];
  for (const p of patientsData) {
    const exists = await patRepo.findOneBy({ name: p.name, user_id: uid });
    if (!exists) {
      const pat = patRepo.create({ ...p, user_id: uid } as any);
      const saved = await patRepo.save(pat);
      patients.push(Array.isArray(saved) ? saved[0] : saved);
    } else {
      patients.push(exists as Patient);
    }
  }
  logger.info(`✓ ${patients.length} pacientes`);

  // ── FERIDAS ────────────────────────────
  const woundRepo = AppDataSource.getRepository(Wound);
  const woundsData = [
    { patient: 0, etiology: 'pressure', location: 'Sacro', laterality: 'center', initial_length_cm: 8, initial_width_cm: 6, onset_date: '2026-07-20' },
    { patient: 1, etiology: 'vascular', location: 'Maléolo lateral', laterality: 'left', initial_length_cm: 5, initial_width_cm: 4, onset_date: '2026-06-10' },
    { patient: 3, etiology: 'diabetic', location: 'Hálux', laterality: 'right', initial_length_cm: 3, initial_width_cm: 2, onset_date: '2026-08-01' },
    { patient: 5, etiology: 'pressure', location: 'Trocânter', laterality: 'left', initial_length_cm: 6, initial_width_cm: 5, onset_date: '2026-05-15' },
  ];

  const wounds: Wound[] = [];
  for (const w of woundsData) {
    const wound = woundRepo.create({
      patient_id: patients[w.patient].id, user_id: uid,
      etiology: w.etiology, location: w.location, laterality: w.laterality,
      initial_length_cm: w.initial_length_cm, initial_width_cm: w.initial_width_cm,
      onset_date: w.onset_date as any,
    });
    wounds.push(await woundRepo.save(wound));
  }
  logger.info(`✓ ${wounds.length} feridas`);

  // ── AVALIAÇÕES ─────────────────────────
  const evalRepo = AppDataSource.getRepository(Evaluation);
  const evalsData = [
    { wound: 0, description: 'Leito com granulação predominante. Sem infecção.', length_cm: 6.5, width_cm: 4.8, granulation_pct: 65, slough_pct: 18, necrosis_pct: 7, epithelialization_pct: 10, exudate_level: 1, dressing_used: 'Espuma Mepilex Border Sacrum' },
    { wound: 0, description: 'Melhora significativa. Granulação em 75%.', length_cm: 5.8, width_cm: 4.2, granulation_pct: 75, slough_pct: 10, necrosis_pct: 3, epithelialization_pct: 12, exudate_level: 1, dressing_used: 'Espuma Mepilex Border Sacrum' },
    { wound: 1, description: 'Úlcera venosa com exsudato moderado.', length_cm: 5, width_cm: 4, granulation_pct: 40, slough_pct: 35, necrosis_pct: 5, epithelialization_pct: 20, exudate_level: 2, dressing_used: 'Bota de Unna + Alginato' },
    { wound: 2, description: 'Pé diabético Wagner grau 2.', length_cm: 3, width_cm: 2, granulation_pct: 30, slough_pct: 50, necrosis_pct: 10, epithelialization_pct: 10, exudate_level: 2, dressing_used: 'Hidrogel + Espuma' },
    { wound: 3, description: 'Úlcera trocantérica em regressão.', length_cm: 4.5, width_cm: 3.8, granulation_pct: 80, slough_pct: 8, necrosis_pct: 2, epithelialization_pct: 10, exudate_level: 0, dressing_used: 'Espuma multicamadas' },
  ];

  for (const e of evalsData) {
    const ev = evalRepo.create({
      wound_id: wounds[e.wound].id, user_id: uid,
      description: e.description, length_cm: e.length_cm, width_cm: e.width_cm,
      area_cm2: e.length_cm * e.width_cm,
      granulation_pct: e.granulation_pct, slough_pct: e.slough_pct,
      necrosis_pct: e.necrosis_pct, epithelialization_pct: e.epithelialization_pct,
      exudate_level: e.exudate_level, dressing_used: e.dressing_used,
    });
    await evalRepo.save(ev);
  }
  logger.info(`✓ ${evalsData.length} avaliações`);

  // ── AGENDA ─────────────────────────────
  const apptRepo = AppDataSource.getRepository(Appointment);
  const today = new Date();
  const apptsData = [
    { patient: 0, hours: 8, min: 30, status: 'confirmed', location_type: 'clinic', procedure_type: 'dressing_change' },
    { patient: 1, hours: 10, min: 0, status: 'confirmed', location_type: 'home', procedure_type: 'evaluation' },
    { patient: 3, hours: 14, min: 0, status: 'scheduled', location_type: 'clinic', procedure_type: 'dressing_change' },
    { patient: 2, hours: 16, min: 30, status: 'confirmed', location_type: 'clinic', procedure_type: 'laser' },
    { patient: 4, hours: 9, min: 0, status: 'scheduled', location_type: 'home', procedure_type: 'evaluation', daysOffset: 1 },
    { patient: 5, hours: 11, min: 0, status: 'confirmed', location_type: 'clinic', procedure_type: 'follow_up', daysOffset: 1 },
    { patient: 6, hours: 15, min: 0, status: 'scheduled', location_type: 'clinic', procedure_type: 'evaluation', daysOffset: 2 },
  ];

  for (const a of apptsData) {
    const d = new Date(today);
    d.setDate(d.getDate() + (a.daysOffset || 0));
    d.setHours(a.hours, a.min, 0, 0);
    const appt = apptRepo.create({
      user_id: uid, patient_id: patients[a.patient].id,
      scheduled_at: d, duration_min: 45,
      status: a.status, location_type: a.location_type, procedure_type: a.procedure_type,
    } as any);
    await apptRepo.save(appt);
  }
  logger.info(`✓ ${apptsData.length} agendamentos`);

  // ── FINANCEIRO ─────────────────────────
  const finRepo = AppDataSource.getRepository(FinancialRecord);
  const finData = [
    { type: 'income', category: 'consultation', amount: 350, description: 'Atendimento Maria Santos', payment_method: 'pix', days: -1 },
    { type: 'income', category: 'consultation', amount: 280, description: 'Atendimento João Oliveira', payment_method: 'credit', days: -2 },
    { type: 'income', category: 'consultation', amount: 450, description: 'Domiciliar + materiais', payment_method: 'transfer', days: -3 },
    { type: 'income', category: 'consultation', amount: 200, description: 'Laser Teresa Lima', payment_method: 'pix', days: -4 },
    { type: 'income', category: 'package', amount: 1200, description: 'Pacote 8 sessões laser', payment_method: 'credit', days: -5 },
    { type: 'income', category: 'consultation', amount: 350, description: 'Avaliação Carlos Souza', payment_method: 'cash', days: -7 },
    { type: 'income', category: 'consultation', amount: 300, description: 'Troca estomia Ana Paula', payment_method: 'pix', days: -8 },
    { type: 'expense', category: 'materials', amount: 890, description: 'Coberturas e materiais', payment_method: 'credit', days: -3 },
    { type: 'expense', category: 'transport', amount: 150, description: 'Combustível domiciliar', payment_method: 'debit', days: -5 },
    { type: 'expense', category: 'rent', amount: 1500, description: 'Aluguel consultório', payment_method: 'transfer', days: -10 },
    { type: 'expense', category: 'other', amount: 120, description: 'Internet + telefone', payment_method: 'debit', days: -10 },
  ];

  for (const f of finData) {
    const d = new Date(today);
    d.setDate(d.getDate() + f.days);
    const rec = finRepo.create({
      user_id: uid, type: f.type, category: f.category, amount: f.amount,
      description: f.description, payment_method: f.payment_method,
      recorded_date: d.toISOString().split('T')[0] as any,
    });
    await finRepo.save(rec);
  }
  logger.info(`✓ ${finData.length} registros financeiros`);

  // ── ESTOQUE ────────────────────────────
  const stockRepo = AppDataSource.getRepository(StockItem);
  const stockData = [
    { name: 'Espuma Mepilex Border 10x10cm', unit: 'un', quantity: 8, min_quantity: 5, unit_cost: 45.90, category: 'dressing', expiry: '2027-06-30' },
    { name: 'Hidrogel Curatec 15g', unit: 'un', quantity: 3, min_quantity: 5, unit_cost: 18.50, category: 'dressing', expiry: '2027-03-15' },
    { name: 'Alginato de cálcio 10x10cm', unit: 'un', quantity: 4, min_quantity: 8, unit_cost: 32.00, category: 'dressing', expiry: '2027-09-20' },
    { name: 'Placa hidrocoloide 15x15cm', unit: 'cm', quantity: 120, min_quantity: 50, unit_cost: 0.85, category: 'dressing', expiry: '2027-12-01' },
    { name: 'Carvão ativado c/ prata', unit: 'un', quantity: 2, min_quantity: 3, unit_cost: 65.00, category: 'dressing', expiry: '2026-10-15' },
    { name: 'Luvas procedimento M', unit: 'un', quantity: 80, min_quantity: 50, unit_cost: 0.45, category: 'consumable', expiry: '2028-01-01' },
    { name: 'SF 0,9% 250ml', unit: 'un', quantity: 15, min_quantity: 10, unit_cost: 4.20, category: 'medication', expiry: '2027-08-01' },
    { name: 'Bolsa estomia 2 peças 60mm', unit: 'un', quantity: 6, min_quantity: 4, unit_cost: 28.00, category: 'equipment', expiry: '2028-06-01' },
  ];

  for (const s of stockData) {
    const item = stockRepo.create({
      user_id: uid, name: s.name, unit: s.unit,
      quantity: s.quantity, min_quantity: s.min_quantity,
      unit_cost: s.unit_cost, category: s.category,
      expiry_date: s.expiry as any,
    });
    await stockRepo.save(item);
  }
  logger.info(`✓ ${stockData.length} itens de estoque`);

  // ── ESTOMIA ────────────────────────────
  const estoRepo = AppDataSource.getRepository(EstomiaEvaluation);
  const esto = estoRepo.create({
    patient_id: patients[4].id, user_id: uid,
    stoma_type: 'colostomy', location: 'Quadrante inferior esquerdo',
    sacs_score: 3, sacs_classification: 'Tipo III - com complicação leve',
    stoma_diameter_mm: 32, bag_type: 'Duas peças', bag_brand: 'Coloplast SenSura',
    peristomal_skin: 'Hiperemia leve em borda superior',
    has_complications: true, complications_detail: 'Dermatite periestoma leve',
    output_characteristics: 'Fezes pastosas, volume moderado',
    notes: 'Orientada sobre cuidados com pele periestoma. Indicado uso de pó protetor.',
  });
  await estoRepo.save(esto);
  logger.info('✓ 1 avaliação de estomia');

  // ── LASER ──────────────────────────────
  const lsRepo = AppDataSource.getRepository(LaserSession);
  for (let i = 1; i <= 4; i++) {
    const ls = lsRepo.create({
      patient_id: patients[2].id, user_id: uid,
      laser_type: 'low_level', wavelength_nm: 660, power_mw: 100,
      energy_j: 4, dose_j_cm2: 4, time_seconds: 40, points_applied: 8,
      application_area: 'Região cervical bilateral',
      indication: 'Dor miofascial cervical',
      session_number: i, total_sessions: 8,
      photosensitive_meds: false,
      observations: i === 4 ? 'Paciente relata melhora de 60% na dor.' : undefined,
    });
    await lsRepo.save(ls);
  }
  logger.info('✓ 4 sessões de laser');

  // ── PODIATRIA ──────────────────────────
  const podRepo = AppDataSource.getRepository(PodiatryEvaluation);
  const pod = podRepo.create({
    patient_id: patients[3].id, user_id: uid,
    foot: 'right',
    conditions: ['onychocryptosis', 'callus', 'fissure'],
    nail_assessment: 'Hálux D com onicocriptose grau II. Demais unhas espessadas.',
    skin_assessment: 'Calosidade plantar em região metatarsal. Fissura calcânea.',
    has_diabetes: true, loss_of_sensitivity: true, vascular_changes: false,
    procedure_performed: 'Cantoplastia hálux D, desbaste de calosidades, hidratação',
    products_used: 'Ureia 20%, antisséptico iodado',
    recommendations: 'Retorno em 30 dias. Hidratação diária. Calçados adequados.',
    observations: 'Paciente diabético com neuropatia. Teste do monofilamento: insensibilidade em 3/10 pontos.',
  });
  await podRepo.save(pod);
  logger.info('✓ 1 avaliação de podiatria');

  // ── PRESCRIÇÕES ────────────────────────
  const { Prescription } = await import('../../models/Prescription');
  const prescRepo = AppDataSource.getRepository(Prescription);
  const prescData = [
    { patient: 0, category: 'enfermagem', description: 'Troca de cobertura com hidrogel', status: 'active' },
    { patient: 1, category: 'estomia', description: 'Troca de bolsa de estomia', status: 'active' },
    { patient: 3, category: 'medicamento', description: 'Analgésico (se necessário)', status: 'active' },
    { patient: 5, category: 'nutricao', description: 'Suplementação proteica', status: 'completed' },
    { patient: 6, category: 'enfermagem', description: 'Limpeza da ferida com SF 0,9%', status: 'completed' },
  ];
  for (const p of prescData) {
    const presc = prescRepo.create({
      user_id: uid, patient_id: patients[p.patient].id,
      category: p.category, description: p.description, status: p.status,
      completed_at: p.status === 'completed' ? new Date() : undefined,
    } as any);
    await prescRepo.save(presc);
  }
  logger.info(`✓ ${prescData.length} prescrições`);

  // ── INSTITUIÇÃO ────────────────────────
  const { Institution } = await import('../../models/Institution');
  const instRepo = AppDataSource.getRepository(Institution);
  const inst = instRepo.create({
    user_id: uid,
    name: 'Clínica Vida & Saúde',
    cnpj: '00.000.000/0001-00',
    email: 'contato@revigorar.com',
    phone: '(11) 4000-0802',
    address: 'Rua Exemplo, 123 — Centro',
  });
  await instRepo.save(inst);
  logger.info('✓ 1 instituição');

  logger.info('');
  logger.info('══════════════════════════════════════');
  logger.info('  Seed completo! Dados de demonstração:');
  logger.info(`  Pacientes:    ${patients.length}`);
  logger.info(`  Feridas:      ${wounds.length}`);
  logger.info(`  Avaliações:   ${evalsData.length}`);
  logger.info(`  Agenda:       ${apptsData.length}`);
  logger.info(`  Financeiro:   ${finData.length}`);
  logger.info(`  Estoque:      ${stockData.length}`);
  logger.info('  Estomia:      1');
  logger.info('  Laser:        4');
  logger.info('  Podiatria:    1');
  logger.info(`  Prescrições:  ${prescData.length}`);
  logger.info('  Instituição:  1');
  logger.info('══════════════════════════════════════');

  await AppDataSource.destroy();
  process.exit(0);
}

seed().catch(err => { logger.error(err); process.exit(1); });
