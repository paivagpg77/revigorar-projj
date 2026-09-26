import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { AppDataSource } from './config/database';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import api from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use('/api', api);
app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada' }));
app.use(errorHandler);

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ PostgreSQL conectado');
    app.listen(env.port, () => {
      logger.info(`✓ REVIGORAR Backend rodando em http://localhost:${env.port}`);
      logger.info(`  ${AppDataSource.entityMetadatas.length} tabelas sincronizadas`);
    });
  } catch (err) { logger.error('✗ Falha:', err); process.exit(1); }
}

bootstrap();
export default app;
