import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { AppDataSource } from './config/database';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authGuard } from './middleware/auth';

// Routes
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import woundRoutes from './routes/wound.routes';
import evaluationRoutes from './routes/evaluation.routes';
import { appointmentRoutes, financialRoutes, stockRoutes } from './routes/business.routes';

const app = express();

// ── Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Health check ───────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString(), env: env.nodeEnv });
});

// ── Public routes ──────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected routes ───────────────────────
app.use('/api/patients',     authGuard, patientRoutes);
app.use('/api/wounds',       authGuard, woundRoutes);
app.use('/api/evaluations',  authGuard, evaluationRoutes);
app.use('/api/appointments', authGuard, appointmentRoutes);
app.use('/api/financial',    authGuard, financialRoutes);
app.use('/api/stock',        authGuard, stockRoutes);

// ── 404 ────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada' });
});

// ── Error handler ──────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────
async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ PostgreSQL conectado');

    app.listen(env.port, () => {
      logger.info(`
  ╔══════════════════════════════════════╗
  ║   REVIGORAR  ·  Backend API         ║
  ║   http://localhost:${String(env.port).padEnd(19)}║
  ║   ${env.nodeEnv.padEnd(35)}║
  ╚══════════════════════════════════════╝`);
    });
  } catch (err) {
    logger.error('✗ Falha ao iniciar:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => { logger.info('SIGTERM'); process.exit(0); });
process.on('SIGINT',  () => { logger.info('SIGINT');  process.exit(0); });

bootstrap();

export default app;
