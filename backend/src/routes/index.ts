import { Router } from 'express';
import { authGuard } from '../middleware/auth';
import * as c from '../controllers';

const api = Router();

// Auth (público)
api.post('/auth/login', c.authLogin);
api.post('/auth/register', c.authRegister);
api.get('/auth/me', authGuard, c.authMe);

// Todas as rotas abaixo precisam de auth
api.use(authGuard);

// Dashboard
api.get('/dashboard/stats', c.dashStats);
api.get('/dashboard/upcoming', c.dashUpcoming);
api.get('/dashboard/weekly-series', c.dashWeekly);
api.get('/dashboard/distribution', c.dashDistribution);

// Patients
api.get('/patients', c.patientsList);
api.get('/patients/:id', c.patientGet);
api.post('/patients', c.patientCreate);
api.put('/patients/:id', c.patientUpdate);
api.delete('/patients/:id', c.patientDelete);

// Assessments (avaliações)
api.get('/assessments', c.assessmentsList);
api.get('/patients/:patientId/wound-assessment', c.assessmentGet);
api.put('/patients/:patientId/wound-assessment/:section', c.assessmentUpdate);

// Evolutions
api.get('/evolutions/feed', c.evolutionsFeed);
api.get('/patients/:patientId/records', c.patientRecords);
api.get('/patients/:patientId/evolution-timeline', c.patientTimeline);

// Agenda
api.get('/agenda', c.agendaGet);
api.post('/agenda/:day', c.agendaCreate);
api.patch('/agenda/appointments/:id', c.agendaUpdateStatus);
api.delete('/agenda/appointments/:id', c.agendaDelete);

// Prescriptions
api.get('/prescriptions', c.prescriptionBoard);
api.post('/prescriptions', c.prescriptionCreate);
api.get('/patients/:patientId/prescriptions', c.prescriptionsByPatient);
api.post('/patients/:patientId/prescriptions', c.prescriptionCreate);
api.put('/prescriptions/:id', c.prescriptionUpdate);
api.delete('/prescriptions/:id', c.prescriptionDelete);
api.get('/dressing-catalog', c.dressingCatalog);

// Stock
api.get('/stock', c.stockList);
api.post('/stock', c.stockCreate);
api.patch('/stock/:id', c.stockUpdate);
api.delete('/stock/:id', c.stockDelete);

// Photos
api.get('/photos', c.photosAll);
api.get('/patients/:patientId/photos', c.photosByPatient);
api.post('/patients/:patientId/photos', c.uploadMiddleware.single('photo'), c.photoUpload);

// Documents
api.get('/patients/:patientId/documents', c.documentsByPatient);
api.post('/patients/:patientId/documents', c.documentCreate);

// Monitoring
api.get('/patients/:patientId/monitoring/messages', c.monitoringMessages);
api.post('/patients/:patientId/monitoring/messages', c.monitoringSend);
api.post('/patients/:patientId/monitoring/request-photo', c.monitoringRequestPhoto);
api.get('/patients/:patientId/monitoring/status', c.monitoringStatus);

// Reports
api.get('/reports', c.reportsList);
api.get('/reports/weekdays', c.reportsWeekdays);
api.get('/reports/distribution', c.reportsDistribution);

// Settings
api.get('/settings/institution', c.settingsGet);
api.put('/settings/institution', c.settingsUpdate);
api.get('/users', c.usersList);
api.post('/users', c.usersCreate);
api.put('/users/:id', c.usersUpdate);
api.delete('/users/:id', c.usersDelete);
api.get('/settings/integrations', c.integrationsGet);
api.patch('/settings/integrations/:name', c.integrationsToggle);
api.put('/settings/security', c.securityUpdate);
api.get('/settings/backup', c.backupGet);
api.post('/settings/backup/run', c.backupRun);
api.put('/settings/backup/frequency', c.backupFrequency);

export default api;
