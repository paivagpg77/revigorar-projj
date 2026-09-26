import { DataSource } from 'typeorm';
import { env } from './env';
import { User, Patient, WoundAssessment, Evolution, Appointment, Prescription, StockItem, Photo, Document, Institution, Integration, BackupSetting, MonitoringMessage } from '../models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host, port: env.db.port,
  username: env.db.user, password: env.db.password, database: env.db.name,
  synchronize: env.isDev,
  logging: env.isDev ? ['error'] : ['error'],
  entities: [User, Patient, WoundAssessment, Evolution, Appointment, Prescription, StockItem, Photo, Document, Institution, Integration, BackupSetting, MonitoringMessage],
});
