import 'reflect-metadata';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import { env } from './config/env';
import { AppDataSource } from './config/database';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import api from './routes';

const app = express();

const corsOrigin = env.corsOrigin || 'http://localhost:5173';

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fotos e demais arquivos enviados pelo usuário.
// O frontend roda em outra origem (5173), então estes headers são
// importantes para que o navegador aceite as imagens servidas em 3000.
const uploadDirectory = path.resolve(env.upload.dir);

app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(
  '/uploads',
  express.static(uploadDirectory, {
    fallthrough: false,
    maxAge: '1h',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=3600');
    },
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api', api);

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use(errorHandler);

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ PostgreSQL conectado');

    app.listen(env.port, () => {
      logger.info(`✓ REVIGORAR Backend rodando em http://localhost:${env.port}`);
      logger.info(`✓ Uploads: ${uploadDirectory}`);
      logger.info(`✓ ${AppDataSource.entityMetadatas.length} tabelas sincronizadas`);
    });
  } catch (error) {
    logger.error('✗ Falha:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
