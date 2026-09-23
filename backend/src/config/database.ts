import { DataSource } from 'typeorm';
import { env } from './env';

import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Wound } from '../models/Wound';
import { Evaluation } from '../models/Evaluation';
import { WoundPhoto } from '../models/WoundPhoto';
import { ClinicalScale } from '../models/ClinicalScale';
import { FinancialRecord } from '../models/FinancialRecord';
import { Appointment } from '../models/Appointment';
import { StockItem } from '../models/StockItem';
import { StockMovement } from '../models/StockMovement';
import { EstomiaEvaluation } from '../models/EstomiaEvaluation';
import { LaserSession } from '../models/LaserSession';
import { PodiatryEvaluation } from '../models/PodiatryEvaluation';
import { Prescription } from '../models/Prescription';
import { Institution } from '../models/Institution';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  synchronize: env.isDev,
  logging: env.isDev ? ['error', 'warn'] : ['error'],
  entities: [
    User,
    Patient,
    Wound,
    Evaluation,
    WoundPhoto,
    ClinicalScale,
    FinancialRecord,
    Appointment,
    StockItem,
    StockMovement,
    EstomiaEvaluation,
    LaserSession,
    PodiatryEvaluation,
    Prescription,
    Institution,
  ],
  migrations: [__dirname + '/../database/migrations/*.ts'],
});
