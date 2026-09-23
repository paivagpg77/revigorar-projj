import { Router } from 'express';
import * as ctrl from '../controllers/specialties.controller';

// Estomia
export const estomiaRoutes = Router();
estomiaRoutes.get('/', ctrl.listEstomias);
estomiaRoutes.get('/patient/:patientId', ctrl.listEstomiasByPatient);
estomiaRoutes.post('/', ctrl.createEstomia);

// Laser
export const laserRoutes = Router();
laserRoutes.get('/', ctrl.listLaserSessions);
laserRoutes.get('/patient/:patientId', ctrl.listLaserByPatient);
laserRoutes.post('/', ctrl.createLaserSession);

// Podiatria
export const podiatryRoutes = Router();
podiatryRoutes.get('/', ctrl.listPodiatry);
podiatryRoutes.get('/patient/:patientId', ctrl.listPodiatryByPatient);
podiatryRoutes.post('/', ctrl.createPodiatry);
