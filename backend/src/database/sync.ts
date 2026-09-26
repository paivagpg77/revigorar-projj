import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import logger from '../utils/logger';

async function sync() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ Banco sincronizado');
    AppDataSource.entityMetadatas.forEach(e => logger.info(`  - ${e.tableName}`));
    await AppDataSource.destroy();
  } catch (err) { console.error('✗ Erro:', err); process.exit(1); }
}
sync();
