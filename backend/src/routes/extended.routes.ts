import { Router } from 'express';
import * as presc from '../controllers/prescription.controller';
import * as inst from '../controllers/institution.controller';
import * as dash from '../controllers/dashboard.controller';
import * as photo from '../controllers/photo.controller';

// ── Prescrições ──────────────────────────
export const prescriptionRoutes = Router();
prescriptionRoutes.get('/', presc.list);
prescriptionRoutes.post('/', presc.create);
prescriptionRoutes.put('/:id/complete', presc.complete);
prescriptionRoutes.put('/:id/reopen', presc.reopen);
prescriptionRoutes.delete('/:id', presc.remove);

// ── Instituição / Configurações ──────────
export const institutionRoutes = Router();
institutionRoutes.get('/', inst.get);
institutionRoutes.put('/', inst.update);

// ── Dashboard ────────────────────────────
export const dashboardRoutes = Router();
dashboardRoutes.get('/stats', dash.dashboardStats);
dashboardRoutes.get('/evolutions', dash.evolutionsFeed);
dashboardRoutes.get('/reports', dash.reports);
dashboardRoutes.get('/photos', dash.photosByPatient);

// ── Fotos / Upload ───────────────────────
export const photoRoutes = Router();
photoRoutes.post('/upload', photo.upload.single('photo'), photo.uploadPhoto);
photoRoutes.get('/evaluation/:evaluationId', photo.listByEvaluation);
photoRoutes.delete('/:id', photo.remove);
