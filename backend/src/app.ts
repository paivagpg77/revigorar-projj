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

/* =====================================================
   HELMET
   ===================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

/* =====================================================
   CORS
   ===================================================== */

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
    ],
  })
);

/* =====================================================
   BODY
   ===================================================== */

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

/* =====================================================
   ARQUIVOS / FOTOS
   ===================================================== */

const uploadDirectory = path.resolve(
  env.upload.dir
);

app.use(
  '/uploads',
  express.static(
    uploadDirectory,
    {
      fallthrough: false,
      maxAge: '1h',

      setHeaders: (res) => {
        res.setHeader(
          'Cross-Origin-Resource-Policy',
          'cross-origin'
        );

        res.setHeader(
          'Access-Control-Allow-Origin',
          env.corsOrigin
        );

        res.setHeader(
          'Access-Control-Allow-Credentials',
          'true'
        );
      },
    }
  )
);

/* =====================================================
   HEALTH CHECK
   ===================================================== */

app.get(
  '/health',
  (_req, res) => {
    res.json({
      status: 'ok',
      ts: new Date().toISOString(),
    });
  }
);

/* =====================================================
   API
   ===================================================== */

app.use(
  '/api',
  api
);

/* =====================================================
   404
   ===================================================== */

app.use(
  (_req, res) => {
    res
      .status(404)
      .json({
        message:
          'Rota não encontrada',
      });
  }
);

/* =====================================================
   ERROR HANDLER
   ===================================================== */

app.use(
  errorHandler
);

/* =====================================================
   START
   ===================================================== */

async function bootstrap() {
  try {
    await AppDataSource.initialize();

    logger.info(
      '✓ PostgreSQL conectado'
    );

    app.listen(
      env.port,
      () => {
        logger.info(
          `✓ REVIGORAR Backend rodando em http://localhost:${env.port}`
        );

        logger.info(
          `✓ Uploads: ${path.resolve(
            env.upload.dir
          )}`
        );

        logger.info(
          `✓ ${AppDataSource.entityMetadatas.length} tabelas sincronizadas`
        );
      }
    );
  } catch (error) {
    logger.error(
      '✗ Falha:',
      error
    );

    process.exit(1);
  }
}

bootstrap();

export default app;