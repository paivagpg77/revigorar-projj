import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'revigorar_dev',
  },
  jwt: { secret: process.env.JWT_SECRET || 'dev_secret', expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  upload: { dir: process.env.UPLOAD_DIR || './uploads', maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) },
  isDev: (process.env.NODE_ENV || 'development') === 'development',
};
